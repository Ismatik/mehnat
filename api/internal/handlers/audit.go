package handlers

// Чтение журнала аудита. ТОЛЬКО чтение — эндпоинтов на изменение/удаление нет.
//   GET /admin/{site}/audit_log  — логи ТОЛЬКО своего сайта (контент-операции;
//       входы и операции с юзерами имеют site=NULL и сюда не попадают).
//   GET /admin/users/audit_log   — ВСЕ логи (только superadmin, через роутер).
// Фильтры (query): action, resource, actor, ip, site, from, to, limit.

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/mehnat/api/internal/httpx"
	"github.com/mehnat/api/internal/middleware"
)

// buildAuditQuery собирает параметризованный SELECT с фильтрами из query-строки.
// forceSite != "" — жёстко ограничить одним сайтом (для admin-site).
func buildAuditQuery(r *http.Request, forceSite string) (string, []interface{}) {
	var conds []string
	var args []interface{}
	n := 1
	add := func(cond string, val interface{}) {
		conds = append(conds, fmt.Sprintf(cond, n))
		args = append(args, val)
		n++
	}
	q := r.URL.Query()

	if forceSite != "" {
		add("site = $%d", forceSite)
	} else if s := q.Get("site"); s != "" {
		add("site = $%d", s)
	}
	if v := q.Get("action"); v != "" {
		add("action = $%d", v)
	}
	if v := q.Get("resource"); v != "" {
		add("resource = $%d", v)
	}
	if v := q.Get("actor"); v != "" {
		add("actor_email ILIKE '%%' || $%d || '%%'", v)
	}
	if v := q.Get("ip"); v != "" {
		add("ip ILIKE '%%' || $%d || '%%'", v)
	}
	if v := q.Get("from"); v != "" {
		add("ts >= $%d::timestamptz", v)
	}
	if v := q.Get("to"); v != "" {
		add("ts <= $%d::timestamptz", v)
	}

	where := ""
	if len(conds) > 0 {
		where = "WHERE " + strings.Join(conds, " AND ")
	}

	limit := 500
	if v := q.Get("limit"); v != "" {
		if l, err := strconv.Atoi(v); err == nil && l > 0 && l <= 5000 {
			limit = l
		}
	}

	sql := fmt.Sprintf(
		`SELECT COALESCE(json_agg(to_jsonb(t) ORDER BY ts DESC), '[]'::json)
		 FROM (SELECT * FROM audit_log %s ORDER BY ts DESC LIMIT %d) t`,
		where, limit,
	)
	return sql, args
}

// AuditSite — GET /admin/{site}/audit_log: логи только текущего сайта.
func (h *Handlers) AuditSite(w http.ResponseWriter, r *http.Request) {
	s := middleware.SiteFrom(r.Context())
	sql, args := buildAuditQuery(r, string(s.Key))
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), sql, args...).Scan(&out); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "query failed")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// AuditAll — GET /admin/users/audit_log: все логи (superadmin).
func (h *Handlers) AuditAll(w http.ResponseWriter, r *http.Request) {
	sql, args := buildAuditQuery(r, "")
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), sql, args...).Scan(&out); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "query failed")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}
