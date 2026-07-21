package handlers

// Общая структура хендлеров и построение параметризованных SQL-запросов.
// Имена таблиц берутся ТОЛЬКО через site.Table() (белый список + регулярка).
// Значения — всегда через плейсхолдеры $1..$n.

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/mehnat/api/internal/auth"
	"github.com/mehnat/api/internal/config"
	"github.com/mehnat/api/internal/middleware"
	"github.com/mehnat/api/internal/resource"
)

// claimsFromRequest — короткий доступ к claims из контекста запроса.
func claimsFromRequest(r *http.Request) *auth.Claims {
	return middleware.ClaimsFrom(r.Context())
}

type Handlers struct {
	Pool *pgxpool.Pool
	Auth *auth.Manager
	Cfg  config.Config
}

func New(pool *pgxpool.Pool, am *auth.Manager, cfg config.Config) *Handlers {
	return &Handlers{Pool: pool, Auth: am, Cfg: cfg}
}

// argFor превращает значение из тела запроса в (плейсхолдер, значение) с учётом типа колонки.
// n — номер плейсхолдера (1-based).
func argFor(col resource.Column, raw json.RawMessage, n int) (string, interface{}, error) {
	ph := "$" + strconv.Itoa(n)
	switch col.Kind {
	case resource.Text:
		var s string
		if err := json.Unmarshal(raw, &s); err != nil {
			return "", nil, fmt.Errorf("field %q must be a string", col.Name)
		}
		return ph, s, nil

	case resource.Int:
		var i int64
		if err := json.Unmarshal(raw, &i); err != nil {
			return "", nil, fmt.Errorf("field %q must be a number", col.Name)
		}
		return ph, i, nil

	case resource.Bool:
		var b bool
		if err := json.Unmarshal(raw, &b); err != nil {
			return "", nil, fmt.Errorf("field %q must be a boolean", col.Name)
		}
		return ph, b, nil

	case resource.JSONB:
		// передаём исходный JSON как текст с явным приведением к jsonb
		return ph + "::jsonb", string(raw), nil

	case resource.TS:
		// null или строка-дата
		if string(raw) == "null" {
			return ph + "::timestamptz", nil, nil
		}
		var s string
		if err := json.Unmarshal(raw, &s); err != nil {
			return "", nil, fmt.Errorf("field %q must be a timestamp string or null", col.Name)
		}
		if s == "" {
			return ph + "::timestamptz", nil, nil
		}
		return ph + "::timestamptz", s, nil

	case resource.BigintNull:
		if string(raw) == "null" {
			return ph, nil, nil
		}
		var i int64
		if err := json.Unmarshal(raw, &i); err != nil {
			return "", nil, fmt.Errorf("field %q must be a number or null", col.Name)
		}
		return ph, i, nil
	}
	return "", nil, fmt.Errorf("unknown column kind for %q", col.Name)
}

// buildInsert строит INSERT со всеми колонками ресурса (отсутствующие в теле — по DEFAULT не вставляем).
func buildInsert(table string, def resource.Def, body map[string]json.RawMessage) (string, []interface{}, error) {
	var cols []string
	var phs []string
	var args []interface{}
	n := 1
	for _, c := range def.Columns {
		raw, ok := body[c.Name]
		if !ok {
			continue // не задано — БД подставит DEFAULT
		}
		ph, val, err := argFor(c, raw, n)
		if err != nil {
			return "", nil, err
		}
		cols = append(cols, c.Name)
		phs = append(phs, ph)
		args = append(args, val)
		n++
	}
	if len(cols) == 0 {
		return "", nil, fmt.Errorf("no fields to insert")
	}
	q := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s) RETURNING to_jsonb(%s.*)",
		table, strings.Join(cols, ", "), strings.Join(phs, ", "), table,
	)
	return q, args, nil
}

// buildUpdate строит UPDATE только по переданным колонкам (частичное обновление).
func buildUpdate(table string, def resource.Def, body map[string]json.RawMessage, id int64) (string, []interface{}, error) {
	var sets []string
	var args []interface{}
	n := 1
	for _, c := range def.Columns {
		raw, ok := body[c.Name]
		if !ok {
			continue
		}
		ph, val, err := argFor(c, raw, n)
		if err != nil {
			return "", nil, err
		}
		sets = append(sets, c.Name+" = "+ph)
		args = append(args, val)
		n++
	}
	if len(sets) == 0 {
		return "", nil, fmt.Errorf("no fields to update")
	}
	if def.UpdatedAt {
		sets = append(sets, "updated_at = now()")
	}
	idPh := "$" + strconv.Itoa(n)
	args = append(args, id)
	q := fmt.Sprintf(
		"UPDATE %s SET %s WHERE id = %s RETURNING to_jsonb(%s.*)",
		table, strings.Join(sets, ", "), idPh, table,
	)
	return q, args, nil
}

// decodeBody читает тело запроса в map[column]json.RawMessage.
func decodeBody(data []byte) (map[string]json.RawMessage, error) {
	m := map[string]json.RawMessage{}
	if len(data) == 0 {
		return m, nil
	}
	if err := json.Unmarshal(data, &m); err != nil {
		return nil, err
	}
	return m, nil
}
