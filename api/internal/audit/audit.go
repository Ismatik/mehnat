package audit

// Запись в журнал аудита. Логируем на стороне API (в хендлерах), чтобы событие
// фиксировалось даже при обходе фронта. Запись — best-effort: ошибка записи лога
// не должна ронять основной запрос (только пишем в stderr).

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Действия (типы событий).
const (
	ActionCreate      = "create"
	ActionUpdate      = "update"
	ActionDelete      = "delete"
	ActionPublish     = "publish"
	ActionUnpublish   = "unpublish"
	ActionLogin       = "login"
	ActionLoginFailed = "login_failed"
	ActionLogout      = "logout"
	ActionUserCreate  = "user_create"
	ActionUserUpdate  = "user_update"
	ActionUserDelete  = "user_delete"
	ActionUpload      = "upload"
)

// Entry — одна запись журнала.
type Entry struct {
	ActorID    *int64
	ActorEmail string
	Action     string
	Site       *string // s1|s2|nil
	Resource   string
	RecordID   *int64
	PageLabel  string
	Diff       interface{} // сериализуется в JSONB
	IP         string
	UserAgent  string
}

// Log вставляет запись. Ошибки не пробрасываем — только логируем.
func Log(ctx context.Context, pool *pgxpool.Pool, e Entry) {
	diff := "{}"
	if e.Diff != nil {
		if b, err := json.Marshal(e.Diff); err == nil {
			diff = string(b)
		}
	}
	_, err := pool.Exec(ctx,
		`INSERT INTO audit_log (actor_id, actor_email, action, site, resource, record_id, page_label, diff, ip, user_agent)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)`,
		e.ActorID, e.ActorEmail, e.Action, e.Site, e.Resource, e.RecordID, e.PageLabel, diff, e.IP, e.UserAgent,
	)
	if err != nil {
		log.Printf("audit: не удалось записать лог (%s): %v", e.Action, err)
	}
}

// ClientIP берёт реальный IP клиента из X-Forwarded-For (за nginx), иначе RemoteAddr.
func ClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// первый адрес в списке — исходный клиент
		if i := strings.IndexByte(xff, ','); i >= 0 {
			return strings.TrimSpace(xff[:i])
		}
		return strings.TrimSpace(xff)
	}
	if xr := r.Header.Get("X-Real-IP"); xr != "" {
		return strings.TrimSpace(xr)
	}
	// RemoteAddr в формате host:port
	if i := strings.LastIndexByte(r.RemoteAddr, ':'); i >= 0 {
		return r.RemoteAddr[:i]
	}
	return r.RemoteAddr
}

// UA — user-agent запроса (обрезаем до разумной длины).
func UA(r *http.Request) string {
	ua := r.Header.Get("User-Agent")
	if len(ua) > 400 {
		ua = ua[:400]
	}
	return ua
}
