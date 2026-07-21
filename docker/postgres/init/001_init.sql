-- ============================================================
--  001_init.sql — схема под утверждённый макет (5 страниц + шаблон)
--  Одна общая БД. users — общая (без префикса). <prefix>_* — контент сайта (s1_/s2_).
--  Все тексты — JSONB {"ru","tg","en"}. Всё редактируется из админки.
--
--  Единый шаблон макета (шапка/hero/форма/футер повторяются на всех страницах):
--    utility bar   → settings (соцсети, языки)
--    masthead      → settings (logo, название), menu
--    hero banner   → у каждой страницы свой заголовок/подзаголовок/фон (pages/settings)
--    форма связи   → contact_messages (POST), на большинстве страниц
--    footer        → settings (телефоны, соцсети, копирайт), footer_links
--
--  Страницы → таблицы:
--    /                  sliders, services(превью), news(превью), settings
--    /novosti           news
--    /o-nas             pages(o-nas)+about_blocks(коллаж/цель/списки), team(опц.)
--    /uslugi            countries (карточки стран: флаг, текст, ссылка)
--    /rabota-v-germanii pages(rabota-v-germanii): body хранит facts/help/professions/steps/documents
--    /kontakty          centers (города), settings (телефоны/почта/адрес), contact_messages
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'editor',        -- superadmin | admin | editor
    site_access TEXT[] NOT NULL DEFAULT '{}',   -- {s1},{s2},{s1,s2}
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== SITE 1 (s1_) ====================

-- Слайдеры/hero главной. title_color — цвет заголовка (в макете бывает белый и оранжевый).
CREATE TABLE IF NOT EXISTS s1_sliders (
    id BIGSERIAL PRIMARY KEY, image_url TEXT NOT NULL,
    title JSONB NOT NULL DEFAULT '{}', subtitle JSONB NOT NULL DEFAULT '{}',
    title_color TEXT DEFAULT '#ffffff', link_url TEXT DEFAULT '',
    cta_label JSONB NOT NULL DEFAULT '{}', cta_url TEXT DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Новости: карточка (обложка, категория-бейдж, заголовок, дата/время) + детальная (body, галерея)
CREATE TABLE IF NOT EXISTS s1_news (
    id BIGSERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL DEFAULT '{}', excerpt JSONB NOT NULL DEFAULT '{}',
    body JSONB NOT NULL DEFAULT '{}', cover_url TEXT DEFAULT '',
    category JSONB NOT NULL DEFAULT '{}',           -- бейдж "Новости" и т.п.
    gallery JSONB NOT NULL DEFAULT '[]',
    published BOOLEAN NOT NULL DEFAULT FALSE, published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Статические/структурные страницы. hero_* — баннер страницы. body — JSONB:
--   для o-nas хранит {goal, list1[], list2[], collage[]};
--   для rabota-v-germanii хранит {facts[], help[], professions[], steps[], documents[], intro}.
CREATE TABLE IF NOT EXISTS s1_pages (
    id BIGSERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL DEFAULT '{}',
    hero_title JSONB NOT NULL DEFAULT '{}', hero_subtitle JSONB NOT NULL DEFAULT '{}',
    hero_image_url TEXT DEFAULT '', hero_title_color TEXT DEFAULT '#ffffff',
    body JSONB NOT NULL DEFAULT '{}',               -- произвольная структура блоков страницы
    seo_title JSONB NOT NULL DEFAULT '{}', seo_desc JSONB NOT NULL DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT TRUE, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Услуги-превью на главной (короткие карточки)
CREATE TABLE IF NOT EXISTS s1_services (
    id BIGSERIAL PRIMARY KEY, title JSONB NOT NULL DEFAULT '{}',
    description JSONB NOT NULL DEFAULT '{}', icon TEXT DEFAULT '',
    link_url TEXT DEFAULT '', sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE);

-- Блок «Чем мы вам поможем» (главная): карточки с иконкой/заголовком/текстом
CREATE TABLE IF NOT EXISTS s1_help_items (
    id BIGSERIAL PRIMARY KEY, icon TEXT DEFAULT '',
    title JSONB NOT NULL DEFAULT '{}', description JSONB NOT NULL DEFAULT '{}',
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

-- Страны назначения (/uslugi): карточка с флагом, описанием, выделением, ссылкой на страницу
CREATE TABLE IF NOT EXISTS s1_countries (
    id BIGSERIAL PRIMARY KEY, name JSONB NOT NULL DEFAULT '{}',
    description JSONB NOT NULL DEFAULT '{}', flag_url TEXT DEFAULT '',
    link_url TEXT DEFAULT '', highlighted BOOLEAN NOT NULL DEFAULT FALSE,
    available BOOLEAN NOT NULL DEFAULT FALSE,        -- есть ли реальная страница/подробнее
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

-- Центры/контакты по городам (/kontakty): Душанбе, Бохтар, Худжанд, Хорог...
CREATE TABLE IF NOT EXISTS s1_centers (
    id BIGSERIAL PRIMARY KEY, city JSONB NOT NULL DEFAULT '{}',
    address JSONB NOT NULL DEFAULT '{}', phone TEXT DEFAULT '',
    email TEXT DEFAULT '', map_url TEXT DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

-- Команда/руководство (опционально для o-nas)
CREATE TABLE IF NOT EXISTS s1_team (
    id BIGSERIAL PRIMARY KEY, full_name JSONB NOT NULL DEFAULT '{}',
    position JSONB NOT NULL DEFAULT '{}', photo_url TEXT DEFAULT '',
    bio JSONB NOT NULL DEFAULT '{}', sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE);

-- Меню (шапка), поддержка выпадающих (parent_id)
CREATE TABLE IF NOT EXISTS s1_menu (
    id BIGSERIAL PRIMARY KEY, label JSONB NOT NULL DEFAULT '{}',
    url TEXT NOT NULL DEFAULT '/', parent_id BIGINT REFERENCES s1_menu(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

-- Ссылки футера
CREATE TABLE IF NOT EXISTS s1_footer_links (
    id BIGSERIAL PRIMARY KEY, label JSONB NOT NULL DEFAULT '{}',
    url TEXT NOT NULL DEFAULT '', column_no INT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

-- Заявки с формы «Связаться с нами» (есть на нескольких страницах)
CREATE TABLE IF NOT EXISTS s1_contact_messages (
    id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL DEFAULT '', email TEXT DEFAULT '',
    phone TEXT DEFAULT '', message TEXT NOT NULL DEFAULT '', source_page TEXT DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Настройки сайта (key/value): logo_url, site_title, ats_url, qr_url,
-- phone_1, phone_2, email, address, facebook_url, instagram_url, youtube_url,
-- copyright, languages, hero_default_image ...
CREATE TABLE IF NOT EXISTS s1_settings (
    key TEXT PRIMARY KEY, value JSONB NOT NULL DEFAULT '{}');

-- ==================== SITE 2 (s2_) — идентично s1 ====================
CREATE TABLE IF NOT EXISTS s2_sliders (
    id BIGSERIAL PRIMARY KEY, image_url TEXT NOT NULL,
    title JSONB NOT NULL DEFAULT '{}', subtitle JSONB NOT NULL DEFAULT '{}',
    title_color TEXT DEFAULT '#ffffff', link_url TEXT DEFAULT '',
    cta_label JSONB NOT NULL DEFAULT '{}', cta_url TEXT DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS s2_news (
    id BIGSERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL DEFAULT '{}', excerpt JSONB NOT NULL DEFAULT '{}',
    body JSONB NOT NULL DEFAULT '{}', cover_url TEXT DEFAULT '',
    category JSONB NOT NULL DEFAULT '{}', gallery JSONB NOT NULL DEFAULT '[]',
    published BOOLEAN NOT NULL DEFAULT FALSE, published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS s2_pages (
    id BIGSERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL,
    title JSONB NOT NULL DEFAULT '{}',
    hero_title JSONB NOT NULL DEFAULT '{}', hero_subtitle JSONB NOT NULL DEFAULT '{}',
    hero_image_url TEXT DEFAULT '', hero_title_color TEXT DEFAULT '#ffffff',
    body JSONB NOT NULL DEFAULT '{}',
    seo_title JSONB NOT NULL DEFAULT '{}', seo_desc JSONB NOT NULL DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT TRUE, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS s2_services (
    id BIGSERIAL PRIMARY KEY, title JSONB NOT NULL DEFAULT '{}',
    description JSONB NOT NULL DEFAULT '{}', icon TEXT DEFAULT '',
    link_url TEXT DEFAULT '', sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE);

-- Блок «Чем мы вам поможем» (главная): карточки с иконкой/заголовком/текстом
CREATE TABLE IF NOT EXISTS s2_help_items (
    id BIGSERIAL PRIMARY KEY, icon TEXT DEFAULT '',
    title JSONB NOT NULL DEFAULT '{}', description JSONB NOT NULL DEFAULT '{}',
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

CREATE TABLE IF NOT EXISTS s2_countries (
    id BIGSERIAL PRIMARY KEY, name JSONB NOT NULL DEFAULT '{}',
    description JSONB NOT NULL DEFAULT '{}', flag_url TEXT DEFAULT '',
    link_url TEXT DEFAULT '', highlighted BOOLEAN NOT NULL DEFAULT FALSE,
    available BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

CREATE TABLE IF NOT EXISTS s2_centers (
    id BIGSERIAL PRIMARY KEY, city JSONB NOT NULL DEFAULT '{}',
    address JSONB NOT NULL DEFAULT '{}', phone TEXT DEFAULT '',
    email TEXT DEFAULT '', map_url TEXT DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

CREATE TABLE IF NOT EXISTS s2_team (
    id BIGSERIAL PRIMARY KEY, full_name JSONB NOT NULL DEFAULT '{}',
    position JSONB NOT NULL DEFAULT '{}', photo_url TEXT DEFAULT '',
    bio JSONB NOT NULL DEFAULT '{}', sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE);

CREATE TABLE IF NOT EXISTS s2_menu (
    id BIGSERIAL PRIMARY KEY, label JSONB NOT NULL DEFAULT '{}',
    url TEXT NOT NULL DEFAULT '/', parent_id BIGINT REFERENCES s2_menu(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

CREATE TABLE IF NOT EXISTS s2_footer_links (
    id BIGSERIAL PRIMARY KEY, label JSONB NOT NULL DEFAULT '{}',
    url TEXT NOT NULL DEFAULT '', column_no INT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE);

CREATE TABLE IF NOT EXISTS s2_contact_messages (
    id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL DEFAULT '', email TEXT DEFAULT '',
    phone TEXT DEFAULT '', message TEXT NOT NULL DEFAULT '', source_page TEXT DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS s2_settings (
    key TEXT PRIMARY KEY, value JSONB NOT NULL DEFAULT '{}');

-- ==================== Индексы ====================
CREATE INDEX IF NOT EXISTS idx_s1_news_pub ON s1_news (published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_s2_news_pub ON s2_news (published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_s1_menu_parent ON s1_menu (parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_s2_menu_parent ON s2_menu (parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_s1_countries_sort ON s1_countries (sort_order);
CREATE INDEX IF NOT EXISTS idx_s2_countries_sort ON s2_countries (sort_order);
