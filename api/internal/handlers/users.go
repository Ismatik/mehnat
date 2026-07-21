package handlers

// Общая админка пользователей. Таблица users — без префикса, общая для всей системы.
// Создание/изменение/удаление — только superadmin (проверяется в роутере).

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"

	"github.com/mehnat/api/internal/auth"
	"github.com/mehnat/api/internal/httpx"
)

var validRoles = map[string]bool{"superadmin": true, "admin": true, "editor": true}
var validSites = map[string]bool{"s1": true, "s2": true}

type userInput struct {
	Email      string   `json:"email"`
	FullName   string   `json:"full_name"`
	Role       string   `json:"role"`
	SiteAccess []string `json:"site_access"`
	Password   string   `json:"password"`
	IsActive   *bool    `json:"is_active"`
}

// allSites — полный доступ (для суперадмина).
func allSites() []string { return []string{"s1", "s2"} }

func sanitizeSites(in []string) []string {
	out := []string{}
	seen := map[string]bool{}
	for _, s := range in {
		if validSites[s] && !seen[s] {
			out = append(out, s)
			seen[s] = true
		}
	}
	return out
}

// UsersList — GET /admin/users.
func (h *Handlers) UsersList(w http.ResponseWriter, r *http.Request) {
	q := `SELECT COALESCE(json_agg(to_jsonb(t) - 'password_hash' ORDER BY id), '[]'::json) FROM users t`
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q).Scan(&out); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "query failed")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// UserCreate — POST /admin/users.
func (h *Handlers) UserCreate(w http.ResponseWriter, r *http.Request) {
	data, _ := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	var in userInput
	if err := json.Unmarshal(data, &in); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if in.Email == "" || in.Password == "" {
		httpx.Error(w, http.StatusBadRequest, "email and password are required")
		return
	}
	if in.Role == "" {
		in.Role = "editor"
	}
	if !validRoles[in.Role] {
		httpx.ErrCode(w, http.StatusBadRequest, "invalid_role", "invalid role")
		return
	}
	hash, err := auth.HashPassword(in.Password)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "hash failed")
		return
	}
	isActive := true
	if in.IsActive != nil {
		isActive = *in.IsActive
	}
	// доступ к сайтам определяет РОЛЬ (на сервере, не полагаемся на фронт):
	// суперадмин — всегда полный доступ; admin/editor — минимум один сайт.
	var sites []string
	if in.Role == "superadmin" {
		sites = allSites()
	} else {
		sites = sanitizeSites(in.SiteAccess)
		if len(sites) == 0 {
			httpx.ErrCode(w, http.StatusBadRequest, "site_required", "at least one site required")
			return
		}
	}

	var out []byte
	err = h.Pool.QueryRow(r.Context(),
		`INSERT INTO users (email, password_hash, full_name, role, site_access, is_active)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING to_jsonb(users.*) - 'password_hash'`,
		in.Email, hash, in.FullName, in.Role, sites, isActive,
	).Scan(&out)
	if err != nil {
		httpx.ErrCode(w, http.StatusBadRequest, "email_exists", "create failed (email may already exist)")
		return
	}
	httpx.Raw(w, http.StatusCreated, out)
}

// UserUpdate — PUT /admin/users/{id}. Пароль меняется только если передан непустым.
func (h *Handlers) UserUpdate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	data, _ := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	// частичное обновление: смотрим, какие поля реально пришли
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json body")
		return
	}
	var in userInput
	_ = json.Unmarshal(data, &in)

	sets := []string{}
	args := []interface{}{}
	n := 1
	add := func(expr string, val interface{}) {
		sets = append(sets, expr+" = $"+strconv.Itoa(n))
		args = append(args, val)
		n++
	}
	if _, ok := raw["email"]; ok {
		add("email", in.Email)
	}
	if _, ok := raw["full_name"]; ok {
		add("full_name", in.FullName)
	}
	if _, ok := raw["role"]; ok {
		if !validRoles[in.Role] {
			httpx.ErrCode(w, http.StatusBadRequest, "invalid_role", "invalid role")
			return
		}
		add("role", in.Role)
	}
	// доступ к сайтам определяет РОЛЬ (на сервере). Вычисляем эффективную роль:
	// если роль в запросе не меняется — берём текущую из БД.
	effRole := in.Role
	if _, ok := raw["role"]; !ok {
		if err := h.Pool.QueryRow(r.Context(), "SELECT role FROM users WHERE id=$1", id).Scan(&effRole); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				httpx.Error(w, http.StatusNotFound, "not found")
				return
			}
			httpx.Error(w, http.StatusInternalServerError, "lookup failed")
			return
		}
	}
	if effRole == "superadmin" {
		// суперадмину всегда полный доступ, присланный site_access игнорируем
		add("site_access", allSites())
	} else if _, ok := raw["site_access"]; ok {
		sites := sanitizeSites(in.SiteAccess)
		if len(sites) == 0 {
			httpx.ErrCode(w, http.StatusBadRequest, "site_required", "at least one site required")
			return
		}
		add("site_access", sites)
	}
	if _, ok := raw["is_active"]; ok && in.IsActive != nil {
		add("is_active", *in.IsActive)
	}
	if in.Password != "" {
		hash, err := auth.HashPassword(in.Password)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "hash failed")
			return
		}
		add("password_hash", hash)
	}
	if len(sets) == 0 {
		httpx.Error(w, http.StatusBadRequest, "nothing to update")
		return
	}
	sets = append(sets, "updated_at = now()")

	query := "UPDATE users SET " + joinComma(sets) + " WHERE id = $" + strconv.Itoa(n) + " RETURNING to_jsonb(users.*) - 'password_hash'"
	args = append(args, id)

	var out []byte
	if err := h.Pool.QueryRow(r.Context(), query, args...).Scan(&out); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpx.Error(w, http.StatusNotFound, "not found")
			return
		}
		httpx.ErrCode(w, http.StatusBadRequest, "email_exists", "update failed (email may already exist)")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// UserDelete — DELETE /admin/users/{id}. Нельзя удалить самого себя.
func (h *Handlers) UserDelete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if c := claimsFromRequest(r); c != nil && c.UserID == id {
		httpx.Error(w, http.StatusBadRequest, "cannot delete yourself")
		return
	}
	ct, err := h.Pool.Exec(r.Context(), "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "delete failed")
		return
	}
	if ct.RowsAffected() == 0 {
		httpx.Error(w, http.StatusNotFound, "not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func joinComma(parts []string) string {
	out := ""
	for i, p := range parts {
		if i > 0 {
			out += ", "
		}
		out += p
	}
	return out
}
