# MEHNAT — два сайта, две админки, общая админка пользователей

Монорепозиторий проекта: два публичных сайта для мигрантов, админка контента
к каждому и одна общая админка для создания пользователей в оба сайта.
Всё в Docker, деплой одной командой.

## Стек

- **Фронт:** Next.js (публичные сайты — статический экспорт, раздаётся nginx;
  динамика — новости — тянется с API в браузере)
- **Бэк:** один Go-API на всё
- **БД:** PostgreSQL, одна общая. Контент сайтов разделён префиксами таблиц
  (`s1_*`, `s2_*`), пользователи — общая таблица `users`
- **Прокси:** nginx, роутинг по доменам

## Архитектура (кратко)

```
                          ┌──────────── nginx ────────────┐
   mmashvarat.tj  ───────▶│  → web-site1 (Next статика)    │
   admin.mmashvarat.tj ──▶│  → admin-site1                 │
   users.mmashvarat.tj ──▶│  → admin-users (общая)         │
   a-khorijakor.tj ──────▶│  → web-site2                   │
   admin.a-khorijakor.tj ▶│  → admin-site2                 │
                          │  /api/* → api (Go)             │
                          └───────────────┬────────────────┘
                                          │
                                    ┌─────▼─────┐
                                    │  api (Go) │  один на всё
                                    └─────┬─────┘
                                          │
                                    ┌─────▼─────┐
                                    │ PostgreSQL│  s1_* / s2_* / users
                                    └───────────┘
```

Ключ сайта (`s1`/`s2`) nginx прокидывает в API заголовком `X-Site-Key`.
API по ключу выбирает префикс таблиц (см. `api/internal/site/site.go`).
Общая админка пользователей ключ не шлёт — она работает с таблицей `users`
и полем `site_access`, определяющим доступ юзера к сайтам.

## Структура

```
mehnat/
├─ docker-compose.yml       оркестрация всех сервисов
├─ .env.example             все переменные (скопировать в .env)
├─ Makefile                 make up / down / logs / db-shell ...
├─ api/                     Go-API (один на всё)
│  ├─ Dockerfile
│  ├─ cmd/server/main.go    точка входа (сейчас каркас + /healthz)
│  ├─ internal/site/        реестр сайтов и префиксы таблиц ← ключевое
│  ├─ internal/{config,db,handlers,middleware,models}/  (наполнить кодом)
│  └─ migrations/001_init.sql   схема БД
├─ web/
│  ├─ site1/                публичный сайт 1 (mmashvarat.tj)
│  └─ site2/                публичный сайт 2 (a-khorijakor.tj)
├─ admin/
│  ├─ admin-site1/          админка контента сайта 1
│  ├─ admin-site2/          админка контента сайта 2
│  └─ admin-users/          ОБЩАЯ админка пользователей
├─ nginx/
│  ├─ nginx.conf
│  └─ conf.d/{site1,site2}.conf
└─ docker/postgres/init/    авто-миграция при первом старте БД
```

## Запуск

```bash
cp .env.example .env      # заполнить POSTGRES_PASSWORD, JWT_SECRET, SEED_ADMIN_PASSWORD
docker compose up -d --build
docker compose ps         # проверить статус
docker compose logs -f api
```

Секреты сгенерировать:
```bash
openssl rand -hex 32      # → JWT_SECRET
openssl rand -hex 16      # → POSTGRES_PASSWORD (и подставить в DATABASE_URL)
```

Проверка API: `curl http://localhost/api/healthz` → `{"status":"ok"}`
(напрямую, минуя nginx, порт API наружу не публикуется — только внутри docker-сети).

## Деплой на сервер (Hetzner)

### 1. Локально (разработка/предпросмотр)
`docker-compose.override.yml` подхватывается автоматически и публикует приложения
на `127.0.0.1:8080..8084` (admin-users / admin-site1 / admin-site2 / web1 / web2)
с прокси `/api`. Это **только для локали** (порты слушают localhost).

```bash
cp .env.example .env      # заполнить секреты (см. ниже)
docker compose up -d --build
```

### 2. Прод-сервер (по доменам, БЕЗ override)
На сервере override НЕ используем — маршрутизация по доменам основным nginx.

```bash
cp .env.example .env
# сгенерировать НОВЫЕ секреты (не из примера!):
openssl rand -hex 32                         # → JWT_SECRET
openssl rand -hex 16                          # → POSTGRES_PASSWORD (подставить и в DATABASE_URL)
# задать свой SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD, домены SITE1_DOMAIN/SITE2_DOMAIN

# прод-запуск без preview-override:
docker compose -f docker-compose.yml up -d --build
```
`-f docker-compose.yml` игнорирует `docker-compose.override.yml`, поэтому preview-порты
наружу НЕ публикуются. Наружу слушает только nginx (80, позже 443). Домены
`mmashvarat.tj`, `admin.mmashvarat.tj`, `users.mmashvarat.tj`, `a-khorijakor.tj`,
`admin.a-khorijakor.tj` направить (A-записи) на IP сервера.

### 3. Временная проверка ДО настройки доменов
Публичный API/сайт по доменам ещё не работает (нет DNS). Проверить можно так:

- **Безопасно (рекомендуется) — SSH-туннель.** Поднять с override (порты на
  127.0.0.1) и пробросить только публичные сайты на свою машину:
  ```bash
  docker compose up -d --build                     # override → порты на 127.0.0.1
  ssh -L 8083:localhost:8083 -L 8084:localhost:8084 user@SERVER_IP
  # затем открыть http://localhost:8083 и http://localhost:8084 у себя
  ```
  Ничего не выставляется в интернет.

- **Альтернатива — firewall Hetzner на свой IP.** Если нужен доступ по `IP:порт`,
  временно опубликовать ТОЛЬКО публичные сайты (8083/8084) на `0.0.0.0` и
  ограничить Hetzner Cloud Firewall'ом доступ к этим портам своим IP.

> ⚠️ **АДМИНКИ НАРУЖУ НЕ ОТКРЫВАТЬ.** Порты `8080` (пользователи), `8081`/`8082`
> (контент s1/s2) — только через SSH-туннель или строго ограниченный firewall.
> В прод-конфиге (без override) админки доступны исключительно по своим доменам
> `admin.*` / `users.*` через nginx; отдельные порты наружу не публикуются.

### Обязательные секреты в `.env`
`POSTGRES_PASSWORD` (и тот же пароль в `DATABASE_URL`), `JWT_SECRET`,
`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`. Домены — `SITE1_DOMAIN`/`SITE2_DOMAIN`.

### Volume загруженных картинок
Файлы из админки (upload) хранятся в docker-volume `uploads_data`
(`/app/uploads` в контейнере api). Volume **переживает пересборку** контейнеров
(`up -d --build` не стирает). Полностью стираются данные только явным
`docker compose down -v` — на проде так не делать.

## Первый администратор

Суперадмин создаётся автоматически при старте API из переменных окружения
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (роль `superadmin`, доступ к обоим
сайтам `{s1,s2}`). Создаётся один раз — если пользователь с таким email уже
есть, повторный старт ничего не меняет. Пароль после первого входа смените
через общую админку пользователей.

Если `SEED_ADMIN_PASSWORD` пуст — суперадмин не создаётся (в логах API будет
предупреждение).

## Переменные окружения (`.env`)

| Переменная | Назначение |
|---|---|
| `POSTGRES_USER/PASSWORD/DB` | учётка PostgreSQL |
| `DATABASE_URL` | строка подключения API к БД (тот же пароль) |
| `API_PORT` | порт API внутри сети (по умолчанию 8080) |
| `JWT_SECRET` | секрет подписи JWT (обязателен, `openssl rand -hex 32`) |
| `JWT_TTL` | срок жизни токена (`24h`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | первый суперадмин |
| `SITE1_KEY` / `SITE2_KEY` | ключи-префиксы сайтов (`s1` / `s2`) |
| `SITE1_DOMAIN` / `SITE2_DOMAIN` | домены сайтов |
| `SITE1_ATS_URL` / `SITE2_ATS_URL` | ссылки на ATS (кнопка + QR на сайтах) |
| `NEXT_PUBLIC_API_BASE` | адрес API для браузера (в проде `/api`) |

## API — эндпоинты

Роуты в коде идут без префикса `/api` — nginx проксирует `/api/` на `api:8080/`,
срезая префикс. Браузер обращается по `/api/...`.

**Публичные (без токена):**
```
GET  /api/healthz
GET  /api/public/{site}/settings
GET  /api/public/{site}/{resource}          # только видимые (is_active/published)
GET  /api/public/{site}/{resource}/{slug}   # news, pages — по slug
POST /api/public/{site}/contact_messages     # заявка с формы сайта
```

**Аутентификация:**
```
POST /api/auth/login        # {email,password} → {token, user}
GET  /api/auth/me           # текущий пользователь по токену
```

**Админка контента (JWT + доступ к сайту):**
```
GET    /api/admin/{site}/settings
PUT    /api/admin/{site}/settings/{key}
POST   /api/admin/{site}/upload              # multipart, поле "file", до 50 МБ
GET    /api/admin/{site}/contact_messages
PUT    /api/admin/{site}/contact_messages/{id}   # {is_read}
DELETE /api/admin/{site}/contact_messages/{id}
GET    /api/admin/{site}/{resource}
POST   /api/admin/{site}/{resource}
PUT    /api/admin/{site}/{resource}/{id}     # частичное обновление
DELETE /api/admin/{site}/{resource}/{id}
```

**Общая админка пользователей (только `superadmin`, без привязки к сайту):**
```
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
```

`{site}` ∈ `{s1, s2}`. `{resource}` — из белого списка: `sliders`, `news`,
`pages`, `services`, `help_items`, `countries`, `centers`, `team`, `menu`,
`footer_links`. Имена таблиц строятся только через `site.Table()` (белый
список + регулярка), SQL — только параметризованный.

Для локальной разработки без реальных доменов — добавить в `/etc/hosts`:
```
127.0.0.1 mmashvarat.tj admin.mmashvarat.tj users.mmashvarat.tj
127.0.0.1 a-khorijakor.tj admin.a-khorijakor.tj
```

## Статус

- [x] **Инфраструктура** — Docker, БД, nginx-роутинг, разделение по префиксам
- [x] **Этап 1 — Go-API** — auth (JWT+bcrypt), CRUD контента per-site,
      settings, заявки, upload, CRUD пользователей (общая админка), сид
      суперадмина и стартового контента обоих сайтов. Собирается и проходит
      end-to-end проверку.
- [x] **Этап 2 — Общая админка пользователей** (`admin/admin-users`) —
      логин superadmin, список пользователей, создание/редактирование/удаление
      (email, ФИО, роль, доступ к сайтам s1/s2, пароль/сброс, активность).
      Собирается в Docker, проходит проверку логина и CRUD.
- [x] **Этап 3 — Админки контента** (`admin/admin-site1`, `admin/admin-site2`) —
      логин, боковое меню разделов, схемо-управляемые формы со всеми ресурсами,
      языковые вкладки ru/tg/en для JSONB, загрузка изображений, drag-сортировка,
      публикация/черновик, структурные редакторы страниц (Германия, О-нас),
      настройки, заявки. Оба сайта из одного кода (отличие — NEXT_PUBLIC_SITE_KEY).
      Собирается в Docker, проверены чтение/запись через прокси.

- [x] **Этап 4 — Публичные сайты** (`web/site1`, `web/site2`) — вёрстка 6 страниц
      1:1 по макету, общие компоненты из settings/menu, контент с API,
      мультиязычность ru/tg/en (переключатель + флаг в шапке, localStorage,
      молчаливый fallback на ru), кроп изображений в админке, адаптив 980/720.
      site2 = тот же код, отличие — `NEXT_PUBLIC_SITE_KEY=s2` и акцент из
      `settings.accent_color` (site-override: s1 красный, s2 зелёный).

**Правило публикации (мультиязычность):** все переводимые JSONB-поля обязаны быть
заполнены на ru/tg/en, иначе публикация запрещена (кнопка «Опубликовать»
неактивна; API возвращает `422 translation_incomplete`). Мягкая трактовка:
полностью пустое необязательное поле не блокирует; поля `required` (заголовок
новости, название страны, заголовок страницы) обязательны на всех языках.
Автоперевода нет — три языка вводятся вручную в админке.

Локальный предпросмотр в браузере: `docker-compose.override.yml` публикует
приложения на портах localhost и проксирует `/api` на Go-API через
Docker-resolver (адреса резолвятся в рантайме):
`8080` admin-users · `8081` admin-site1 · `8082` admin-site2 ·
`8083` web-site1 · `8084` web-site2. Для чистого прод-запуска (маршрутизация
по доменам) — удалить override-файл.

Наполнение демо-контентом с переводами: `scripts/i18n_fill_s1.sql` (s1) и
`scripts/i18n_fill_s2.sql` (s2, свой бренд/тексты). Применяются в БД один раз:
`docker compose exec -T db psql -U $POSTGRES_USER -d $POSTGRES_DB < scripts/i18n_fill_s1.sql`.

- [ ] HTTPS (сертификаты), перенос на сервер заказчика
