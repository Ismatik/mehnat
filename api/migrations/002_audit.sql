-- ============================================================
--  002_audit.sql — журнал аудита (общий, один на всё, БЕЗ префикса сайта).
--  Чёрный ящик: только запись и чтение. Эндпоинтов на update/delete НЕТ ни для
--  кого (включая суперадмина) — неизменяемость обеспечивается отсутствием API.
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGSERIAL PRIMARY KEY,
    ts          TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_id    BIGINT,                       -- кто (NULL для неудачного входа)
    actor_email TEXT NOT NULL DEFAULT '',
    action      TEXT NOT NULL,                -- create|update|delete|publish|unpublish|login|login_failed|logout|user_create|user_update|user_delete
    site        TEXT,                         -- s1|s2|NULL (общие операции)
    resource    TEXT NOT NULL DEFAULT '',     -- news|sliders|pages|users|...
    record_id   BIGINT,                       -- ID затронутой записи
    page_label  TEXT NOT NULL DEFAULT '',     -- человекочитаемо (заголовок/почта/slug)
    diff        JSONB NOT NULL DEFAULT '{}',  -- {field:{old,new}} для update
    ip          TEXT NOT NULL DEFAULT '',
    user_agent  TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_audit_ts       ON audit_log (ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_site     ON audit_log (site, ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action   ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_actor    ON audit_log (actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log (resource);
