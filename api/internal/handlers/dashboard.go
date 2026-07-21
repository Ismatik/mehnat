package handlers

// Сводка для суперадмина (общая админка): заявки, опубликованные новости по
// сайтам, число пользователей, активность редакторов за период, последние
// действия из журнала. Только чтение. Роут — под /admin/users (только superadmin).

import (
	"fmt"
	"net/http"

	"github.com/mehnat/api/internal/httpx"
	"github.com/mehnat/api/internal/site"
)

type siteStat struct {
	Site      string `json:"site"`
	MsgTotal  int    `json:"messages_total"`
	MsgUnread int    `json:"messages_unread"`
	NewsPub   int    `json:"news_published"`
}

// Dashboard — GET /admin/users/dashboard.
func (h *Handlers) Dashboard(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// по каждому сайту: заявки (всего/новых) + опубликованные новости
	var stats []siteStat
	for _, key := range []string{h.Cfg.Site1Key, h.Cfg.Site2Key} {
		s, err := site.Resolve(key)
		if err != nil {
			continue
		}
		st := siteStat{Site: key}
		_ = h.Pool.QueryRow(ctx, fmt.Sprintf("SELECT count(*), count(*) FILTER (WHERE is_read = false) FROM %s", s.Table("contact_messages"))).Scan(&st.MsgTotal, &st.MsgUnread)
		_ = h.Pool.QueryRow(ctx, fmt.Sprintf("SELECT count(*) FROM %s WHERE published = true", s.Table("news"))).Scan(&st.NewsPub)
		stats = append(stats, st)
	}

	// число пользователей
	var usersTotal, usersActive int
	_ = h.Pool.QueryRow(ctx, "SELECT count(*), count(*) FILTER (WHERE is_active = true) FROM users").Scan(&usersTotal, &usersActive)

	// активность редакторов за 7 дней (кроме входов/выходов)
	var activity []byte
	_ = h.Pool.QueryRow(ctx,
		`SELECT COALESCE(json_agg(json_build_object('actor_email', actor_email, 'count', c) ORDER BY c DESC), '[]'::json)
		 FROM (
		   SELECT actor_email, count(*) AS c FROM audit_log
		   WHERE ts > now() - interval '7 days'
		     AND action NOT IN ('login','logout','login_failed')
		     AND actor_email <> ''
		   GROUP BY actor_email ORDER BY c DESC LIMIT 10
		 ) t`).Scan(&activity)

	// последние действия
	var recent []byte
	_ = h.Pool.QueryRow(ctx,
		`SELECT COALESCE(json_agg(to_jsonb(t) ORDER BY ts DESC), '[]'::json)
		 FROM (SELECT * FROM audit_log ORDER BY ts DESC LIMIT 15) t`).Scan(&recent)

	httpx.JSON(w, http.StatusOK, map[string]interface{}{
		"users":    map[string]int{"total": usersTotal, "active": usersActive},
		"sites":    stats,
		"activity": rawJSON(activity),
		"recent":   rawJSON(recent),
	})
}

// rawJSON оборачивает уже-JSON []byte, чтобы httpx.JSON не экранировал его как строку.
func rawJSON(b []byte) interface{} {
	if len(b) == 0 {
		return []interface{}{}
	}
	return jsonRaw(b)
}

// jsonRaw — тип-обёртка, сериализующийся как есть.
type jsonRaw []byte

func (j jsonRaw) MarshalJSON() ([]byte, error) { return j, nil }
