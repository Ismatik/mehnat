package handlers

// Валидатор публикации: перед тем как контент становится published/active,
// проверяем, что все переводимые поля заполнены на всех трёх языках (ru/tg/en).
// Автоперевода нет — редакторы вводят языки вручную; тут только страховка.
//
// Правило (защита от ЧАСТИЧНОГО перевода):
//   - объект считается «переводом», если содержит только ключи из {ru,tg,en};
//   - если такой объект заполнен хотя бы на одном языке, но пуст на другом —
//     это неполный перевод → публикацию блокируем (422) с перечнем полей/языков;
//   - полностью пустой объект (нет ни одного языка) публикацию НЕ блокирует
//     (необязательное поле, которое вообще не заполняли).

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"

	"github.com/mehnat/api/internal/httpx"
	"github.com/mehnat/api/internal/resource"
)

// writePublishError отдаёт 422 с перечнем незаполненных полей/языков.
func writePublishError(w http.ResponseWriter, problems []LangProblem) {
	httpx.JSON(w, http.StatusUnprocessableEntity, map[string]interface{}{
		"error":   "translation_incomplete",
		"message": problemsMessage(problems),
		"fields":  problems,
	})
}

// LangProblem — одно поле с неполным переводом и список пустых языков.
type LangProblem struct {
	Field string   `json:"field"`
	Langs []string `json:"langs"`
}

var i18nLangs = []string{"ru", "tg", "en"}

// isI18nObject — объект-перевод: непустой и все ключи ∈ {ru,tg,en}.
func isI18nObject(m map[string]interface{}) bool {
	if len(m) == 0 {
		return false
	}
	for k := range m {
		if k != "ru" && k != "tg" && k != "en" {
			return false
		}
	}
	return true
}

// emptyLangs возвращает языки, где значение пусто (или отсутствует).
func emptyLangs(m map[string]interface{}) []string {
	var out []string
	for _, l := range i18nLangs {
		v, ok := m[l]
		s, _ := v.(string)
		if !ok || strings.TrimSpace(s) == "" {
			out = append(out, l)
		}
	}
	return out
}

// collectI18nProblems рекурсивно обходит значение и собирает неполные переводы.
func collectI18nProblems(value interface{}, path string, out *[]LangProblem) {
	switch v := value.(type) {
	case map[string]interface{}:
		if isI18nObject(v) {
			empty := emptyLangs(v)
			// частичный перевод: что-то заполнено, но не всё
			if len(empty) > 0 && len(empty) < len(i18nLangs) {
				*out = append(*out, LangProblem{Field: path, Langs: empty})
			}
			return
		}
		// структурный объект — рекурсия по ключам
		keys := make([]string, 0, len(v))
		for k := range v {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			child := path
			if child != "" {
				child += "."
			}
			child += k
			collectI18nProblems(v[k], child, out)
		}
	case []interface{}:
		for i, item := range v {
			collectI18nProblems(item, path+"["+itoa(i)+"]", out)
		}
	}
}

func itoa(i int) string {
	if i == 0 {
		return "0"
	}
	neg := i < 0
	if neg {
		i = -i
	}
	var b [20]byte
	p := len(b)
	for i > 0 {
		p--
		b[p] = byte('0' + i%10)
		i /= 10
	}
	if neg {
		p--
		b[p] = '-'
	}
	return string(b[p:])
}

// defaultPublished — значение флага публикации по умолчанию (как в схеме БД).
func defaultPublished(flag string) bool {
	// published (news) стартует как FALSE, is_active/is_published — TRUE.
	return flag != "published"
}

// validatePublish проверяет объединённую строку (JSONB-колонки ресурса) на
// полноту переводов. Возвращает список проблем (пустой — всё хорошо).
func validatePublish(def resource.Def, jsonbValues map[string]interface{}) []LangProblem {
	required := map[string]bool{}
	for _, name := range def.RequiredI18n {
		required[name] = true
	}
	var problems []LangProblem
	for _, c := range def.Columns {
		if c.Kind != resource.JSONB {
			continue
		}
		val, ok := jsonbValues[c.Name]
		if required[c.Name] {
			// строгая проверка: должно быть заполнено на всех языках,
			// пусто-везде тоже недопустимо.
			m, _ := val.(map[string]interface{})
			if empty := emptyLangs(m); len(empty) > 0 {
				problems = append(problems, LangProblem{Field: c.Name, Langs: empty})
			}
			continue
		}
		if ok {
			collectI18nProblems(val, c.Name, &problems)
		}
	}
	return problems
}

// decodeJSONBColumns разбирает JSONB-колонки из тела запроса в map[col]any.
func decodeJSONBColumns(def resource.Def, body map[string]json.RawMessage) map[string]interface{} {
	out := map[string]interface{}{}
	for _, c := range def.Columns {
		if c.Kind != resource.JSONB {
			continue
		}
		if raw, ok := body[c.Name]; ok {
			var v interface{}
			if err := json.Unmarshal(raw, &v); err == nil {
				out[c.Name] = v
			}
		}
	}
	return out
}

// problemsMessage — читаемое сообщение об ошибке для admin/логов.
func problemsMessage(problems []LangProblem) string {
	langName := map[string]string{"ru": "русский", "tg": "тоҷикӣ", "en": "english"}
	parts := make([]string, 0, len(problems))
	for _, p := range problems {
		ls := make([]string, 0, len(p.Langs))
		for _, l := range p.Langs {
			ls = append(ls, langName[l])
		}
		parts = append(parts, p.Field+" ("+strings.Join(ls, ", ")+")")
	}
	return "нельзя опубликовать: не заполнен перевод — " + strings.Join(parts, "; ")
}
