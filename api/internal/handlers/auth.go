package handlers

// Логин администратора: email+пароль → JWT.

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/jackc/pgx/v5"

	"github.com/mehnat/api/internal/auth"
	"github.com/mehnat/api/internal/httpx"
)

type loginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login — POST /auth/login.
func (h *Handlers) Login(w http.ResponseWriter, r *http.Request) {
	data, _ := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	var in loginInput
	if err := json.Unmarshal(data, &in); err != nil || in.Email == "" || in.Password == "" {
		httpx.Error(w, http.StatusBadRequest, "email and password are required")
		return
	}

	var (
		id           int64
		passwordHash string
		fullName     string
		role         string
		siteAccess   []string
		isActive     bool
	)
	err := h.Pool.QueryRow(r.Context(),
		`SELECT id, password_hash, full_name, role, site_access, is_active
		 FROM users WHERE email = $1`, in.Email,
	).Scan(&id, &passwordHash, &fullName, &role, &siteAccess, &isActive)

	// одинаковый ответ на «нет юзера» и «неверный пароль» — не раскрываем детали
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpx.Error(w, http.StatusUnauthorized, "invalid credentials")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, "login failed")
		return
	}
	if !isActive {
		httpx.Error(w, http.StatusForbidden, "account disabled")
		return
	}
	if !auth.CheckPassword(passwordHash, in.Password) {
		httpx.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := h.Auth.Issue(id, in.Email, role, siteAccess)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "token issue failed")
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":          id,
			"email":       in.Email,
			"full_name":   fullName,
			"role":        role,
			"site_access": siteAccess,
		},
	})
}

// Me — GET /auth/me: текущий пользователь по токену (для восстановления сессии в админке).
func (h *Handlers) Me(w http.ResponseWriter, r *http.Request) {
	c := claimsFromRequest(r)
	if c == nil {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]interface{}{
		"id":          c.UserID,
		"email":       c.Email,
		"role":        c.Role,
		"site_access": c.SiteAccess,
	})
}
