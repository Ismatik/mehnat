package config

// Чтение конфигурации из переменных окружения. Никаких секретов в коде —
// всё приходит из .env через docker-compose.

import (
	"os"
	"time"
)

type Config struct {
	DatabaseURL string
	Port        string
	JWTSecret   string
	JWTTTL      time.Duration
	AppEnv      string

	Site1Key string
	Site2Key string

	UploadDir     string
	MaxUploadSize int64 // байт

	SeedAdminEmail    string
	SeedAdminPassword string
}

func Load() Config {
	c := Config{
		DatabaseURL:       getenv("DATABASE_URL", "postgres://mehnat:mehnat@db:5432/mehnat?sslmode=disable"),
		Port:              getenv("API_PORT", "8080"),
		JWTSecret:         getenv("JWT_SECRET", ""),
		AppEnv:            getenv("APP_ENV", "production"),
		Site1Key:          getenv("SITE1_KEY", "s1"),
		Site2Key:          getenv("SITE2_KEY", "s2"),
		UploadDir:         getenv("UPLOAD_DIR", "/app/uploads"),
		MaxUploadSize:     50 << 20, // 50 MB, как в nginx client_max_body_size
		SeedAdminEmail:    getenv("SEED_ADMIN_EMAIL", "admin@mehnat.tj"),
		SeedAdminPassword: getenv("SEED_ADMIN_PASSWORD", ""),
	}

	ttl, err := time.ParseDuration(getenv("JWT_TTL", "24h"))
	if err != nil {
		ttl = 24 * time.Hour
	}
	c.JWTTTL = ttl

	return c
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
