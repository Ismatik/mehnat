package handlers

// Логин администратора: email+пароль → JWT.

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"

	"github.com/mehnat/api/internal/audit"
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
		httpx.ErrCode(w, http.StatusBadRequest, "credentials_required", "email and password are required")
		return
	}

	// защита от перебора: блокировка по IP/email после N неудач
	ip := audit.ClientIP(r)
	ipKey := "ip:" + ip
	emailKey := "email:" + strings.ToLower(in.Email)
	if _, blocked := h.Limiter.Blocked(ipKey, emailKey); blocked {
		h.auditLoginFailed(r, in.Email, "too many attempts")
		httpx.ErrCode(w, http.StatusTooManyRequests, "too_many_attempts", "too many failed attempts, try later")
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
			h.loginFail(w, r, in.Email, ip, ipKey, emailKey, "no such user", "invalid_credentials", http.StatusUnauthorized)
			return
		}
		httpx.ErrCode(w, http.StatusInternalServerError, "login_failed", "login failed")
		return
	}
	if !isActive {
		h.loginFail(w, r, in.Email, ip, ipKey, emailKey, "account disabled", "account_disabled", http.StatusForbidden)
		return
	}
	if !auth.CheckPassword(passwordHash, in.Password) {
		h.loginFail(w, r, in.Email, ip, ipKey, emailKey, "wrong password", "invalid_credentials", http.StatusUnauthorized)
		return
	}

	token, err := h.Auth.Issue(id, in.Email, role, siteAccess)
	if err != nil {
		httpx.ErrCode(w, http.StatusInternalServerError, "login_failed", "token issue failed")
		return
	}

	// успешный вход — сбрасываем счётчики блокировки
	h.Limiter.Reset(ipKey, emailKey)
	audit.Log(r.Context(), h.Pool, audit.Entry{
		ActorID: &id, ActorEmail: in.Email, Action: audit.ActionLogin,
		IP: ip, UserAgent: audit.UA(r),
	})

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

// auditLoginFailed — запись неудачной попытки входа (actor_id неизвестен).
func (h *Handlers) auditLoginFailed(r *http.Request, email, reason string) {
	audit.Log(r.Context(), h.Pool, audit.Entry{
		ActorEmail: email, Action: audit.ActionLoginFailed, PageLabel: reason,
		IP: audit.ClientIP(r), UserAgent: audit.UA(r),
	})
}

// loginFail: лог неудачи + учёт в лимитере; при достижении порога — блокировка,
// уведомление суперадмину и отдельная запись в аудит. Затем отдаёт ошибку.
func (h *Handlers) loginFail(w http.ResponseWriter, r *http.Request, email, ip, ipKey, emailKey, reason, code string, status int) {
	h.auditLoginFailed(r, email, reason)
	if h.Limiter.Fail(ipKey, emailKey) {
		msg := fmt.Sprintf(
			"Многократные неудачные попытки входа в админку МЕХНАТ.\n\nПочта: %s\nIP: %s\nПревышен порог %d попыток — вход временно заблокирован на %d мин.",
			email, ip, h.Limiter.Max(), h.Limiter.LockoutMinutes(),
		)
		h.Notify.Notify("МЕХНАТ: блокировка входа (перебор пароля)", msg)
		audit.Log(r.Context(), h.Pool, audit.Entry{
			ActorEmail: email, Action: audit.ActionLoginFailed, PageLabel: "блокировка (превышен лимит попыток)",
			IP: ip, UserAgent: audit.UA(r),
		})
	}
	httpx.ErrCode(w, status, code, reason)
}

// Logout — POST /auth/logout: фиксируем выход (токен инвалидируется на клиенте).
func (h *Handlers) Logout(w http.ResponseWriter, r *http.Request) {
	c := claimsFromRequest(r)
	if c == nil {
		httpx.ErrCode(w, http.StatusUnauthorized, "unauthorized", "unauthorized")
		return
	}
	id := c.UserID
	audit.Log(r.Context(), h.Pool, audit.Entry{
		ActorID: &id, ActorEmail: c.Email, Action: audit.ActionLogout,
		IP: audit.ClientIP(r), UserAgent: audit.UA(r),
	})
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
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
