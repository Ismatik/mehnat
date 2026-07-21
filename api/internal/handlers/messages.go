package handlers

// contact_messages — заявки с формы «Связаться с нами».
// POST — публичный (с сайта). Чтение и пометка прочитанным — в админке.

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/mehnat/api/internal/httpx"
	"github.com/mehnat/api/internal/middleware"
)

type contactInput struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Message    string `json:"message"`
	SourcePage string `json:"source_page"`
}

// PublicContactCreate — POST /public/{site}/contact_messages.
func (h *Handlers) PublicContactCreate(w http.ResponseWriter, r *http.Request) {
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table("contact_messages")

	data, _ := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	var in contactInput
	if err := json.Unmarshal(data, &in); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if in.Name == "" || in.Message == "" {
		httpx.Error(w, http.StatusBadRequest, "name and message are required")
		return
	}
	q := fmt.Sprintf(
		`INSERT INTO %s (name, email, phone, message, source_page)
		 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		tbl,
	)
	var id int64
	if err := h.Pool.QueryRow(r.Context(), q, in.Name, in.Email, in.Phone, in.Message, in.SourcePage).Scan(&id); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "save failed")
		return
	}
	httpx.JSON(w, http.StatusCreated, map[string]interface{}{"id": id, "status": "ok"})
}

// AdminMessagesList — GET /admin/{site}/contact_messages.
func (h *Handlers) AdminMessagesList(w http.ResponseWriter, r *http.Request) {
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table("contact_messages")
	q := fmt.Sprintf(
		"SELECT COALESCE(json_agg(to_jsonb(t) ORDER BY created_at DESC), '[]'::json) FROM %s t",
		tbl,
	)
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q).Scan(&out); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "query failed")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// AdminMessageMarkRead — PUT /admin/{site}/contact_messages/{id}: пометка прочитанным.
// Тело: {"is_read": true|false} (по умолчанию true).
func (h *Handlers) AdminMessageMarkRead(w http.ResponseWriter, r *http.Request) {
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table("contact_messages")
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	isRead := true
	data, _ := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if len(data) > 0 {
		var b struct {
			IsRead *bool `json:"is_read"`
		}
		if err := json.Unmarshal(data, &b); err == nil && b.IsRead != nil {
			isRead = *b.IsRead
		}
	}
	q := fmt.Sprintf("UPDATE %s SET is_read = $1 WHERE id = $2 RETURNING to_jsonb(%s.*)", tbl, tbl)
	var out []byte
	if err := h.Pool.QueryRow(r.Context(), q, isRead, id).Scan(&out); err != nil {
		httpx.Error(w, http.StatusNotFound, "not found")
		return
	}
	httpx.Raw(w, http.StatusOK, out)
}

// AdminMessageDelete — DELETE /admin/{site}/contact_messages/{id}.
func (h *Handlers) AdminMessageDelete(w http.ResponseWriter, r *http.Request) {
	s := middleware.SiteFrom(r.Context())
	tbl := s.Table("contact_messages")
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	ct, err := h.Pool.Exec(r.Context(), fmt.Sprintf("DELETE FROM %s WHERE id = $1", tbl), id)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "delete failed")
		return
	}
	if ct.RowsAffected() == 0 {
		httpx.Error(w, http.StatusNotFound, "not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
