package handlers

// Обобщённый CRUD для ресурсов контента (sliders, news, pages, services,
// help_items, countries, centers, team, menu, footer_links).
// Публичные GET отдают только опубликованные/активные записи.

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"

	"github.com/mehnat/api/internal/httpx"
	"github.com/mehnat/api/internal/middleware"
	"github.com/mehnat/api/internal/resource"
)

// resolveResource достаёт описание ресурса из пути и валидирует по белому списку.
func resolveResource(w http.ResponseWriter, r *http.Request) (resource.Def, bool) {
	name := chi.URLParam(r, "resource")
	def, ok := resource.Get(name)
	if !ok {
		httpx.Error(w, http.StatusNotFound, "unknown resource")
		return resource.Def{}, false
	}
	return def, true
}

// PublicList — GET /public/{site}/{resource}: только видимые записи.
func (h *Handlers) PublicList(w http.ResponseWriter, r *http.Request) {
	def, ok := resolveResource(w, r)
	if !ok {
		return
	}
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table(def.Table)

	q := fmt.Sprintf(
		"SELECT COALESCE(json_agg(to_jsonb(t) ORDER BY %s), '[]'::json) FROM %s t WHERE %s = TRUE",
		def.OrderBy, tbl, def.PublicFlag,
	)
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q).Scan(&out); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "query failed")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// PublicBySlug — GET /public/{site}/{resource}/{slug} для news/pages.
func (h *Handlers) PublicBySlug(w http.ResponseWriter, r *http.Request) {
	def, ok := resolveResource(w, r)
	if !ok {
		return
	}
	if def.SlugColumn == "" {
		httpx.Error(w, http.StatusNotFound, "resource has no slug")
		return
	}
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table(def.Table)
	slug := chi.URLParam(r, "slug")

	q := fmt.Sprintf(
		"SELECT to_jsonb(t) FROM %s t WHERE %s = $1 AND %s = TRUE",
		tbl, def.SlugColumn, def.PublicFlag,
	)
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q, slug).Scan(&out); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpx.Error(w, http.StatusNotFound, "not found")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, "query failed")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// AdminList — GET /admin/{site}/{resource}: все записи для админки.
func (h *Handlers) AdminList(w http.ResponseWriter, r *http.Request) {
	def, ok := resolveResource(w, r)
	if !ok {
		return
	}
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table(def.Table)

	q := fmt.Sprintf(
		"SELECT COALESCE(json_agg(to_jsonb(t) ORDER BY %s), '[]'::json) FROM %s t",
		def.OrderBy, tbl,
	)
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q).Scan(&out); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "query failed")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// AdminCreate — POST /admin/{site}/{resource}.
func (h *Handlers) AdminCreate(w http.ResponseWriter, r *http.Request) {
	def, ok := resolveResource(w, r)
	if !ok {
		return
	}
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table(def.Table)

	data, _ := io.ReadAll(io.LimitReader(r.Body, 4<<20))
	body, err := decodeBody(data)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json body")
		return
	}
	// проверка полноты переводов перед публикацией
	if def.PublicFlag != "" {
		published := defaultPublished(def.PublicFlag)
		if raw, ok := body[def.PublicFlag]; ok {
			_ = json.Unmarshal(raw, &published)
		}
		if published {
			if problems := validatePublish(def, decodeJSONBColumns(def, body)); len(problems) > 0 {
				writePublishError(w, problems)
				return
			}
		}
	}

	q, args, err := buildInsert(tbl, def, body)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q, args...).Scan(&out); err != nil {
		httpx.Error(w, http.StatusBadRequest, "insert failed: "+err.Error())
		return
	}
	httpx.Raw(w, http.StatusCreated, out)
}

// AdminUpdate — PUT /admin/{site}/{resource}/{id}.
func (h *Handlers) AdminUpdate(w http.ResponseWriter, r *http.Request) {
	def, ok := resolveResource(w, r)
	if !ok {
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table(def.Table)

	data, _ := io.ReadAll(io.LimitReader(r.Body, 4<<20))
	body, err := decodeBody(data)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json body")
		return
	}
	// проверка полноты переводов перед публикацией (на объединённой строке)
	if def.PublicFlag != "" {
		var existingRaw []byte
		if err := h.Pool.QueryRow(r.Context(),
			fmt.Sprintf("SELECT to_jsonb(t) FROM %s t WHERE id = $1", tbl), id).Scan(&existingRaw); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				httpx.Error(w, http.StatusNotFound, "not found")
				return
			}
			httpx.Error(w, http.StatusInternalServerError, "query failed")
			return
		}
		var existing map[string]interface{}
		_ = json.Unmarshal(existingRaw, &existing)

		willPublish := false
		if raw, ok := body[def.PublicFlag]; ok {
			_ = json.Unmarshal(raw, &willPublish)
		} else if b, ok := existing[def.PublicFlag].(bool); ok {
			willPublish = b
		}

		if willPublish {
			merged := map[string]interface{}{}
			for _, c := range def.Columns {
				if c.Kind == resource.JSONB {
					if v, ok := existing[c.Name]; ok {
						merged[c.Name] = v
					}
				}
			}
			for k, v := range decodeJSONBColumns(def, body) {
				merged[k] = v
			}
			if problems := validatePublish(def, merged); len(problems) > 0 {
				writePublishError(w, problems)
				return
			}
		}
	}

	q, args, err := buildUpdate(tbl, def, body, id)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q, args...).Scan(&out); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			httpx.Error(w, http.StatusNotFound, "not found")
			return
		}
		httpx.Error(w, http.StatusBadRequest, "update failed: "+err.Error())
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// AdminDelete — DELETE /admin/{site}/{resource}/{id}.
func (h *Handlers) AdminDelete(w http.ResponseWriter, r *http.Request) {
	def, ok := resolveResource(w, r)
	if !ok {
		return
	}
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table(def.Table)

	ct, err := h.Pool.Exec(r.Context(), fmt.Sprintf("DELETE FROM %s WHERE id = $1", tbl), id)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "delete failed: "+err.Error())
		return
	}
	if ct.RowsAffected() == 0 {
		httpx.Error(w, http.StatusNotFound, "not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
