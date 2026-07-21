# Короткие команды. Требуется docker + docker compose.

.PHONY: help up down build logs ps restart db-shell migrate clean

help:
	@echo "make up       — поднять всё (сборка + запуск)"
	@echo "make down     — остановить всё"
	@echo "make build    — пересобрать образы"
	@echo "make logs      — логи всех сервисов (Ctrl+C для выхода)"
	@echo "make ps       — статус контейнеров"
	@echo "make restart  — перезапуск"
	@echo "make db-shell — psql внутри контейнера БД"
	@echo "make clean    — down + удалить том БД (ОСТОРОЖНО: сотрёт данные)"

up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

restart:
	docker compose restart

db-shell:
	docker compose exec db psql -U $${POSTGRES_USER:-mehnat} -d $${POSTGRES_DB:-mehnat}

clean:
	docker compose down -v
