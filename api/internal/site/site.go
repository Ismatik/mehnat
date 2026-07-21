package site

// Здесь живёт вся логика «какой сайт — какой префикс таблиц».
// Один Go-API обслуживает оба сайта и обе их админки; отличаются они
// только префиксом таблиц в общей БД. Пользователи (users) — общие, без префикса.

import (
	"errors"
	"fmt"
	"os"
	"regexp"
)

// Key — идентификатор сайта, он же префикс таблиц: "s1", "s2".
type Key string

var (
	ErrUnknownSite = errors.New("unknown site key")
	// имена таблиц строим только из [a-z0-9_] (префиксы сайтов s1/s2 содержат цифру),
	// чтобы исключить SQL-инъекцию через префикс
	safeName = regexp.MustCompile(`^[a-z][a-z0-9_]*$`)
)

// Site — описание одного сайта.
type Site struct {
	Key    Key    // s1 / s2  (= префикс)
	Domain string // mmashvarat.tj / a-khorijakor.tj
}

// registry заполняется из переменных окружения при старте (Load).
var registry = map[Key]Site{}

// Load читает SITE1_KEY/SITE2_KEY и домены из env и наполняет реестр.
func Load() {
	s1 := Key(getenv("SITE1_KEY", "s1"))
	s2 := Key(getenv("SITE2_KEY", "s2"))
	registry[s1] = Site{Key: s1, Domain: getenv("SITE1_DOMAIN", "mmashvarat.tj")}
	registry[s2] = Site{Key: s2, Domain: getenv("SITE2_DOMAIN", "a-khorijakor.tj")}
}

// Resolve проверяет, что siteKey валиден и известен.
func Resolve(raw string) (Site, error) {
	k := Key(raw)
	s, ok := registry[k]
	if !ok {
		return Site{}, ErrUnknownSite
	}
	return s, nil
}

// Table возвращает безопасное имя таблицы с префиксом сайта:
//   Table("s1", "news")  -> "s1_news"
// Используется при построении запросов к контенту конкретного сайта.
func (s Site) Table(base string) string {
	name := fmt.Sprintf("%s_%s", s.Key, base)
	if !safeName.MatchString(name) {
		// это программерская ошибка (base пришёл не из белого списка) — паника уместна
		panic("unsafe table name: " + name)
	}
	return name
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
