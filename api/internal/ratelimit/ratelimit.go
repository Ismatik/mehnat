package ratelimit

// Ограничитель попыток входа: после N неудач в окне для ключа (IP или email)
// — временная блокировка на lockout. In-memory (один инстанс API).

import (
	"os"
	"strconv"
	"sync"
	"time"
)

type entry struct {
	count int
	first time.Time
	until time.Time // время окончания блокировки (zero — не заблокирован)
}

type Limiter struct {
	mu      sync.Mutex
	m       map[string]*entry
	max     int
	window  time.Duration
	lockout time.Duration
}

func New(max int, window, lockout time.Duration) *Limiter {
	if max < 1 {
		max = 5
	}
	return &Limiter{m: map[string]*entry{}, max: max, window: window, lockout: lockout}
}

// FromEnv: LOGIN_MAX_ATTEMPTS(5), LOGIN_WINDOW_MINUTES(15), LOGIN_LOCKOUT_MINUTES(15).
func FromEnv() *Limiter {
	return New(
		envInt("LOGIN_MAX_ATTEMPTS", 5),
		time.Duration(envInt("LOGIN_WINDOW_MINUTES", 15))*time.Minute,
		time.Duration(envInt("LOGIN_LOCKOUT_MINUTES", 15))*time.Minute,
	)
}

// Blocked — заблокирован ли любой из ключей; возвращает время разблокировки.
func (l *Limiter) Blocked(keys ...string) (time.Time, bool) {
	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()
	var until time.Time
	blocked := false
	for _, k := range keys {
		if e := l.m[k]; e != nil && now.Before(e.until) {
			blocked = true
			if e.until.After(until) {
				until = e.until
			}
		}
	}
	return until, blocked
}

// Fail фиксирует неудачу по всем ключам. Возвращает true, если хотя бы один
// ключ ТОЛЬКО ЧТО перешёл в блокировку (для уведомления).
func (l *Limiter) Fail(keys ...string) bool {
	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()
	justLocked := false
	for _, k := range keys {
		e := l.m[k]
		if e == nil || now.Sub(e.first) > l.window {
			e = &entry{first: now}
			l.m[k] = e
		}
		if now.Before(e.until) {
			continue // уже заблокирован
		}
		e.count++
		if e.count >= l.max {
			e.until = now.Add(l.lockout)
			e.count = 0
			e.first = now
			justLocked = true
		}
	}
	return justLocked
}

// Reset снимает счётчики/блокировку (после успешного входа).
func (l *Limiter) Reset(keys ...string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	for _, k := range keys {
		delete(l.m, k)
	}
}

// LockoutMinutes — длительность блокировки в минутах (для сообщений).
func (l *Limiter) LockoutMinutes() int { return int(l.lockout / time.Minute) }
func (l *Limiter) Max() int            { return l.max }

func envInt(k string, def int) int {
	if v := os.Getenv(k); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			return n
		}
	}
	return def
}
