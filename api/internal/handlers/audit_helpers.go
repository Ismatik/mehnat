package handlers

// Помощники аудита контента: человекочитаемая метка записи и вычисление diff.

import (
	"encoding/json"
	"net/http"

	"github.com/mehnat/api/internal/audit"
	"github.com/mehnat/api/internal/middleware"
	"github.com/mehnat/api/internal/resource"
)

// i18nRu достаёт русский вариант из i18n-объекта {ru,tg,en} или строки.
func i18nRu(v interface{}) string {
	if m, ok := v.(map[string]interface{}); ok {
		if s, ok := m["ru"].(string); ok {
			return s
		}
	}
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

// pageLabel — человекочитаемая метка записи (заголовок/название/slug/email).
func pageLabel(row map[string]interface{}) string {
	for _, k := range []string{"title", "name", "city", "label", "full_name"} {
		if s := i18nRu(row[k]); s != "" {
			return s
		}
	}
	if s, ok := row["slug"].(string); ok && s != "" {
		return s
	}
	if s, ok := row["email"].(string); ok && s != "" {
		return s
	}
	return ""
}

// computeDiff — {поле:{old,new}} по редактируемым колонкам, где значение изменилось.
func computeDiff(oldRow, newRow map[string]interface{}, def resource.Def) map[string]map[string]interface{} {
	diff := map[string]map[string]interface{}{}
	for _, c := range def.Columns {
		ov, nv := oldRow[c.Name], newRow[c.Name]
		ob, _ := json.Marshal(ov)
		nb, _ := json.Marshal(nv)
		if string(ob) != string(nb) {
			diff[c.Name] = map[string]interface{}{"old": ov, "new": nv}
		}
	}
	return diff
}

// rowFromJSON разбирает []byte (to_jsonb) в map.
func rowFromJSON(b []byte) map[string]interface{} {
	m := map[string]interface{}{}
	_ = json.Unmarshal(b, &m)
	return m
}

// rowID достаёт id из разобранной строки.
func rowID(row map[string]interface{}) *int64 {
	if f, ok := row["id"].(float64); ok {
		v := int64(f)
		return &v
	}
	return nil
}

// auditContent пишет запись аудита операции над контентом (site из контекста).
func (h *Handlers) auditContent(r *http.Request, action, res string, recordID *int64, label string, diff interface{}) {
	c := middleware.ClaimsFrom(r.Context())
	s := middleware.SiteFrom(r.Context())
	site := string(s.Key)
	var actorID *int64
	actorEmail := ""
	if c != nil {
		actorID = &c.UserID
		actorEmail = c.Email
	}
	audit.Log(r.Context(), h.Pool, audit.Entry{
		ActorID: actorID, ActorEmail: actorEmail, Action: action,
		Site: &site, Resource: res, RecordID: recordID, PageLabel: label,
		Diff: diff, IP: audit.ClientIP(r), UserAgent: audit.UA(r),
	})
}

// auditUser пишет запись об операции с пользователем (site=NULL — общая операция).
func (h *Handlers) auditUser(r *http.Request, action string, recordID *int64, email string, diff interface{}) {
	c := middleware.ClaimsFrom(r.Context())
	var actorID *int64
	actorEmail := ""
	if c != nil {
		actorID = &c.UserID
		actorEmail = c.Email
	}
	audit.Log(r.Context(), h.Pool, audit.Entry{
		ActorID: actorID, ActorEmail: actorEmail, Action: action,
		Site: nil, Resource: "users", RecordID: recordID, PageLabel: email,
		Diff: diff, IP: audit.ClientIP(r), UserAgent: audit.UA(r),
	})
}
