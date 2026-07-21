# Короткие команды. Требуется docker + docker compose.

.PHONY: help up down build logs ps restart db-shell migrate clean backup backups restore

help:
	@echo "make up       — поднять всё (сборка + запуск)"
	@echo "make down     — остановить всё"
	@echo "make build    — пересобрать образы"
	@echo "make logs      — логи всех сервисов (Ctrl+C для выхода)"
	@echo "make ps       — статус контейнеров"
	@echo "make restart  — перезапуск"
	@echo "make db-shell — psql внутри контейнера БД"
	@echo "make backup   — сделать бэкап БД сейчас"
	@echo "make backups  — список дампов"
	@echo "make restore FILE=mehnat_....sql.gz — восстановить БД из дампа"
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

backup:
	docker compose exec backup sh /backup.sh once

backups:
	docker compose exec backup ls -lh /backups

restore:
	@test -n "$(FILE)" || { echo "Укажи файл: make restore FILE=mehnat_....sql.gz"; exit 1; }
	docker compose exec backup sh /backup.sh restore $(FILE)

clean:
	docker compose down -v
