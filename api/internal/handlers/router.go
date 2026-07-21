package handlers

// Сборка маршрутов. ВАЖНО: nginx проксирует /api/ на api:8080/ со слэшем,
// то есть срезает префикс /api. Поэтому здесь маршруты идут БЕЗ /api:
//   /healthz
//   /auth/login, /auth/me
//   /public/{site}/...      (без токена)
//   /admin/{site}/...       (JWT + доступ к сайту)
//   /admin/users/...        (JWT + роль superadmin)
//   /uploads/*              (отдача загруженных файлов)

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/mehnat/api/internal/middleware"
)

func (h *Handlers) Router() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Recover)
	r.Use(middleware.CORS)

	// health — для docker healthcheck и nginx
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	// раздача загруженных файлов
	fs := http.FileServer(http.Dir(h.Cfg.UploadDir))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", fs))

	// аутентификация
	r.Post("/auth/login", h.Login)
	r.Group(func(r chi.Router) {
		r.Use(middleware.Auth(h.Auth))
		r.Get("/auth/me", h.Me)
	})

	// ---- Публичные данные сайта (без токена) ----
	r.Route("/public/{site}", func(r chi.Router) {
		r.Use(middleware.ResolveSite)
		r.Get("/settings", h.PublicSettings)
		r.Post("/contact_messages", h.PublicContactCreate)
		r.Get("/{resource}", h.PublicList)
		r.Get("/{resource}/{slug}", h.PublicBySlug)
	})

	// ---- Общая админка пользователей (только superadmin) ----
	r.Route("/admin/users", func(r chi.Router) {
		r.Use(middleware.Auth(h.Auth))
		r.Use(middleware.RequireRole("superadmin"))
		r.Get("/", h.UsersList)
		r.Post("/", h.UserCreate)
		r.Put("/{id}", h.UserUpdate)
		r.Delete("/{id}", h.UserDelete)
	})

	// ---- Админка контента конкретного сайта ----
	r.Route("/admin/{site}", func(r chi.Router) {
		r.Use(middleware.Auth(h.Auth))
		r.Use(middleware.RequireRole("superadmin", "admin", "editor"))
		r.Use(middleware.ResolveSite)
		r.Use(middleware.RequireSiteAccess)

		r.Get("/settings", h.AdminSettings)
		r.Put("/settings/{key}", h.AdminSettingPut)
		r.Post("/upload", h.Upload)

		r.Get("/contact_messages", h.AdminMessagesList)
		r.Put("/contact_messages/{id}", h.AdminMessageMarkRead)
		r.Delete("/contact_messages/{id}", h.AdminMessageDelete)

		r.Get("/{resource}", h.AdminList)
		r.Post("/{resource}", h.AdminCreate)
		r.Put("/{resource}/{id}", h.AdminUpdate)
		r.Delete("/{resource}/{id}", h.AdminDelete)
	})

	return r
}
