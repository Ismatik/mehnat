package middleware

// Middleware: recover, CORS, JWT-аутентификация, проверка роли,
// резолв сайта из URL-пути через internal/site.

import (
	"context"
	"log"
	"net/http"
	"runtime/debug"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/mehnat/api/internal/auth"
	"github.com/mehnat/api/internal/httpx"
	"github.com/mehnat/api/internal/site"
)

type ctxKey string

const (
	ctxClaims ctxKey = "claims"
	ctxSite   ctxKey = "site"
)

// Recover ловит паники в хендлерах и отдаёт 500, не роняя процесс.
func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("panic: %v\n%s", rec, debug.Stack())
				httpx.Error(w, http.StatusInternalServerError, "internal server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// CORS — на случай прямого обращения браузера в dev (в проде всё через nginx на том же origin).
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Site-Key")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// Auth проверяет Bearer-JWT и кладёт claims в контекст.
func Auth(m *auth.Manager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			if !strings.HasPrefix(h, "Bearer ") {
				httpx.Error(w, http.StatusUnauthorized, "missing bearer token")
				return
			}
			claims, err := m.Parse(strings.TrimPrefix(h, "Bearer "))
			if err != nil {
				httpx.Error(w, http.StatusUnauthorized, "invalid or expired token")
				return
			}
			ctx := context.WithValue(r.Context(), ctxClaims, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole пропускает только пользователей с одной из ролей.
func RequireRole(roles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]bool, len(roles))
	for _, r := range roles {
		allowed[r] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			c := ClaimsFrom(r.Context())
			if c == nil || !allowed[c.Role] {
				httpx.Error(w, http.StatusForbidden, "insufficient role")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// ResolveSite берёт {site} из URL-пути, валидирует через реестр и кладёт в контекст.
// Используется для /public/{site}/... и /admin/{site}/...
func ResolveSite(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw := chi.URLParam(r, "site")
		s, err := site.Resolve(raw)
		if err != nil {
			httpx.Error(w, http.StatusNotFound, "unknown site")
			return
		}
		ctx := context.WithValue(r.Context(), ctxSite, s)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireSiteAccess проверяет, что у пользователя есть доступ к сайту из пути.
// Должен идти ПОСЛЕ Auth и ResolveSite.
func RequireSiteAccess(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := ClaimsFrom(r.Context())
		s := SiteFrom(r.Context())
		if c == nil || s.Key == "" || !c.HasSite(string(s.Key)) {
			httpx.Error(w, http.StatusForbidden, "no access to this site")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ---- аксессоры контекста ----

func ClaimsFrom(ctx context.Context) *auth.Claims {
	c, _ := ctx.Value(ctxClaims).(*auth.Claims)
	return c
}

func SiteFrom(ctx context.Context) site.Site {
	s, _ := ctx.Value(ctxSite).(site.Site)
	return s
}
