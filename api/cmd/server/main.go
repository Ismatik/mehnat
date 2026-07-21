package main

// Точка входа Go-API. Поднимает пул БД, прогоняет миграции, сеет стартовые
// данные, монтирует chi-роутер и запускает HTTP-сервер с graceful shutdown.

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/mehnat/api/internal/auth"
	"github.com/mehnat/api/internal/config"
	"github.com/mehnat/api/internal/db"
	"github.com/mehnat/api/internal/handlers"
	"github.com/mehnat/api/internal/seed"
	"github.com/mehnat/api/internal/site"
)

func main() {
	cfg := config.Load()

	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	// Реестр сайтов из env (s1/s2 + домены).
	site.Load()

	ctx := context.Background()

	// Подключение к БД с ретраями (БД может подниматься дольше API).
	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer pool.Close()

	// Миграции (идемпотентны). Каталог рядом с бинарём в контейнере.
	migDir := os.Getenv("MIGRATIONS_DIR")
	if migDir == "" {
		migDir = "/app/migrations"
	}
	if _, statErr := os.Stat(migDir); statErr == nil {
		if err := db.Migrate(ctx, pool, migDir); err != nil {
			log.Fatalf("migrate: %v", err)
		}
		log.Println("migrations applied")
	} else {
		log.Printf("migrations dir %q not found — пропускаю (БД, вероятно, уже инициализирована)", migDir)
	}

	// Посев стартовых данных.
	if err := seed.Run(ctx, pool, cfg); err != nil {
		log.Fatalf("seed: %v", err)
	}

	authMgr := auth.NewManager(cfg.JWTSecret, cfg.JWTTTL)
	h := handlers.New(pool, authMgr, cfg)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           h.Router(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("API listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
	log.Println("API stopped")
}
