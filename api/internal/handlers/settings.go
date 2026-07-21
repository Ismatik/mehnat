package handlers

// settings — key/value с JSONB-значением. Отдаём как единый объект {key: value}.

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/mehnat/api/internal/audit"
	"github.com/mehnat/api/internal/httpx"
	"github.com/mehnat/api/internal/middleware"
)

// settingsObject возвращает все настройки сайта как один JSON-объект.
func (h *Handlers) settingsObject(w http.ResponseWriter, r *http.Request) {
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table("settings")
	q := fmt.Sprintf(
		"SELECT COALESCE(jsonb_object_agg(key, value), '{}'::jsonb) FROM %s",
		tbl,
	)
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q).Scan(&out); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "query failed")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// PublicSettings — GET /public/{site}/settings.
func (h *Handlers) PublicSettings(w http.ResponseWriter, r *http.Request) { h.settingsObject(w, r) }

// AdminSettings — GET /admin/{site}/settings.
func (h *Handlers) AdminSettings(w http.ResponseWriter, r *http.Request) { h.settingsObject(w, r) }

// AdminSettingPut — PUT /admin/{site}/settings/{key}: тело — произвольный JSON-value.
func (h *Handlers) AdminSettingPut(w http.ResponseWriter, r *http.Request) {
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table("settings")
	key := chi.URLParam(r, "key")
	if key == "" {
		httpx.Error(w, http.StatusBadRequest, "empty key")
		return
	}
	data, _ := io.ReadAll(io.LimitReader(r.Body, 4<<20))
	if len(data) == 0 {
		data = []byte("null")
	}

	// старое значение — для diff в аудите
	var oldRaw []byte
	_ = h.Pool.QueryRow(r.Context(), fmt.Sprintf("SELECT value FROM %s WHERE key = $1", tbl), key).Scan(&oldRaw)

	q := fmt.Sprintf(
		`INSERT INTO %s (key, value) VALUES ($1, $2::jsonb)
		 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
		 RETURNING to_jsonb(%s.*)`,
		tbl, tbl,
	)
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q, key, string(data)).Scan(&out); err != nil {
		httpx.Error(w, http.StatusBadRequest, "save failed: "+err.Error())
		return
	}

	// аудит: логируем изменение настройки с diff по ключу (было→стало)
	var oldV, newV interface{}
	_ = json.Unmarshal(oldRaw, &oldV)
	_ = json.Unmarshal(data, &newV)
	ob, _ := json.Marshal(oldV)
	nb, _ := json.Marshal(newV)
	if string(ob) != string(nb) {
		diff := map[string]map[string]interface{}{key: {"old": oldV, "new": newV}}
		h.auditContent(r, audit.ActionUpdate, "settings", nil, key, diff)
	}
	httpx.Raw(w, http.StatusOK, out)
}
