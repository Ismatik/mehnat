package auth

// JWT-выпуск/проверка и bcrypt для паролей. Секрет — из env.

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Claims — полезная нагрузка токена админ-сессии.
type Claims struct {
	UserID     int64    `json:"uid"`
	Email      string   `json:"email"`
	Role       string   `json:"role"`        // superadmin | admin | editor
	SiteAccess []string `json:"sites"`       // {s1},{s2},{s1,s2}
	jwt.RegisteredClaims
}

var ErrInvalidToken = errors.New("invalid token")

// Manager инкапсулирует секрет и TTL.
type Manager struct {
	secret []byte
	ttl    time.Duration
}

func NewManager(secret string, ttl time.Duration) *Manager {
	return &Manager{secret: []byte(secret), ttl: ttl}
}

// Issue выпускает подписанный токен для пользователя.
func (m *Manager) Issue(uid int64, email, role string, sites []string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID:     uid,
		Email:      email,
		Role:       role,
		SiteAccess: sites,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.ttl)),
		},
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return tok.SignedString(m.secret)
}

// Parse проверяет подпись/срок и возвращает claims.
func (m *Manager) Parse(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	tok, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return m.secret, nil
	})
	if err != nil || !tok.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

// HashPassword — bcrypt-хеш пароля.
func HashPassword(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	return string(b), err
}

// CheckPassword сверяет пароль с хешем.
func CheckPassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}

// HasSite проверяет доступ пользователя к сайту (superadmin — ко всем).
func (c *Claims) HasSite(siteKey string) bool {
	if c.Role == "superadmin" {
		return true
	}
	for _, s := range c.SiteAccess {
		if s == siteKey {
			return true
		}
	}
	return false
}
