package httpx

// Небольшие помощники для единообразных JSON-ответов и ошибок.

import (
	"encoding/json"
	"net/http"
)

// JSON пишет произвольное значение как JSON с заданным статусом.
func JSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if v == nil {
		return
	}
	_ = json.NewEncoder(w).Encode(v)
}

// Raw пишет уже готовый JSON (json.RawMessage / []byte) без повторного кодирования.
func Raw(w http.ResponseWriter, status int, raw []byte) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if len(raw) == 0 {
		_, _ = w.Write([]byte("null"))
		return
	}
	_, _ = w.Write(raw)
}

// Error пишет JSON вида {"error":"..."}.
func Error(w http.ResponseWriter, status int, msg string) {
	JSON(w, status, map[string]string{"error": msg})
}

// ErrCode пишет JSON вида {"error":"<стабильный_код>","message":"<англ. описание>"}.
// Фронт маппит код на локализованный текст (ru/tg/en), message — для логов/отладки.
func ErrCode(w http.ResponseWriter, status int, code, msg string) {
	JSON(w, status, map[string]string{"error": code, "message": msg})
}
