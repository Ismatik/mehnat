package handlers

// Загрузка файлов из админки. Файлы кладём в том UPLOAD_DIR, отдаём URL.
// Браузер получит /api/uploads/<file>; nginx срежет /api → API отдаст /uploads/<file>.

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/mehnat/api/internal/audit"
	"github.com/mehnat/api/internal/httpx"
	"github.com/mehnat/api/internal/middleware"
)

var allowedExt = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
	".svg": true, ".pdf": true,
}

// Upload — POST /admin/{site}/upload (multipart form-data, поле "file").
func (h *Handlers) Upload(w http.ResponseWriter, r *http.Request) {
	s := middleware.SiteFrom(r.Context())

	if err := r.ParseMultipartForm(h.Cfg.MaxUploadSize); err != nil {
		httpx.Error(w, http.StatusBadRequest, "file too large or invalid form")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "missing file field")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExt[ext] {
		httpx.Error(w, http.StatusBadRequest, "unsupported file type")
		return
	}

	// уникальное имя: <site>_<random>.<ext>
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "name generation failed")
		return
	}
	name := string(s.Key) + "_" + hex.EncodeToString(buf) + ext

	if err := os.MkdirAll(h.Cfg.UploadDir, 0o755); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "storage unavailable")
		return
	}
	dst, err := os.Create(filepath.Join(h.Cfg.UploadDir, name))
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "cannot save file")
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, io.LimitReader(file, h.Cfg.MaxUploadSize)); err != nil {
		httpx.Error(w, http.StatusInternalServerError, "write failed")
		return
	}

	url := "/api/uploads/" + name

	// аудит: что за поле/раздел загрузили (label передаёт фронт)
	label := r.FormValue("label")
	if label == "" {
		label = header.Filename
	}
	h.auditContent(r, audit.ActionUpload, "upload", nil, label,
		map[string]interface{}{"file": map[string]interface{}{"old": "", "new": url}})

	httpx.JSON(w, http.StatusCreated, map[string]string{"url": url, "filename": name})
}
