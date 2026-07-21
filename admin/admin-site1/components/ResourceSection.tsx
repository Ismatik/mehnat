"use client";

// Универсальный раздел: список записей ресурса + форма создания/редактирования.
// Драг-сортировка (для ресурсов с sort_order), публикация/черновик, удаление.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listResource,
  createResource,
  updateResource,
  deleteResource,
  ApiError,
  type FieldProblem,
} from "../lib/api";
import { localize, LANGS, type Lang } from "../lib/i18n";
import {
  type ResourceDef,
  type Field,
  newRow,
  PAGE_BODY_SCHEMAS,
} from "../lib/schema";
import { validateRow } from "../lib/validate";
import {
  FieldEditor,
  LangProvider,
  LangTabs,
  useLang,
  type FieldCtx,
} from "./Fields";
import { useT } from "./uilang";

const SHORT: Record<Lang, string> = { ru: "RU", tg: "ТҶ", en: "EN" };

export default function ResourceSection({ def, onAuthError }: { def: ResourceDef; onAuthError: () => void }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const dragFrom = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listResource(def.key));
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return onAuthError();
      setError(e instanceof ApiError ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [def.key, onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  const menuItems = useMemo(
    () => rows.map((r) => ({ id: r.id, label: localize(r[def.titleField]) || `#${r.id}` })),
    [rows, def.titleField]
  );

  async function togglePublish(row: any) {
    if (!def.publishField) return;
    try {
      await updateResource(def.key, row.id, { [def.publishField]: !row[def.publishField] });
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Ошибка");
    }
  }

  async function remove(row: any) {
    if (!window.confirm("Удалить запись? Действие необратимо.")) return;
    try {
      await deleteResource(def.key, row.id);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Ошибка удаления");
    }
  }

  // Сохранить порядок: проставить sort_order по индексу и записать изменённые.
  async function persistOrder(next: any[]) {
    setRows(next);
    try {
      await Promise.all(
        next.map((r, i) => (r.sort_order !== i ? updateResource(def.key, r.id, { sort_order: i }) : null)).filter(Boolean) as Promise<any>[]
      );
    } catch {
      load();
    }
  }
  function reorder(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return;
    const cp = [...rows];
    const [m] = cp.splice(from, 1);
    cp.splice(to, 0, m);
    persistOrder(cp);
  }

  if (editing !== null) {
    return (
      <RecordForm
        def={def}
        record={editing}
        menuItems={menuItems}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
        onAuthError={onAuthError}
      />
    );
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1>{def.icon} {def.label}</h1>
          <div className="muted">{rows.length} {rows.length === 1 ? "запись" : "записей"}</div>
        </div>
        <div className="spacer" />
        {!def.fixed && (
          <button className="btn btn-primary" onClick={() => setEditing(newRow(def))}>
            + Добавить
          </button>
        )}
      </div>

      {error && <div className="alert alert-err">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="center-note">Загрузка…</div>
        ) : rows.length === 0 ? (
          <div className="center-note">Записей пока нет.</div>
        ) : (
          <div className="list">
            {rows.map((row, i) => {
              const published = def.publishField ? row[def.publishField] : true;
              return (
                <div
                  key={row.id}
                  className="list-row"
                  draggable={def.sortable}
                  onDragStart={() => (dragFrom.current = i)}
                  onDragOver={(e) => def.sortable && e.preventDefault()}
                  onDrop={() => {
                    if (dragFrom.current !== null) reorder(dragFrom.current, i);
                    dragFrom.current = null;
                  }}
                >
                  {def.sortable && <span className="drag-handle" title="Перетащите для сортировки">⠿</span>}
                  <div className="list-title">
                    <div className="lt-main">{localize(row[def.titleField]) || <span className="muted">— без названия —</span>}</div>
                    <div className="lt-sub muted">
                      {def.key === "news" && row.slug ? `/${row.slug}` : ""}
                      {def.key === "pages" && row.slug ? `/${row.slug}` : ""}
                      {def.key === "centers" && row.phone ? row.phone : ""}
                    </div>
                  </div>
                  <div className="spacer" />
                  {def.publishField && (
                    <button
                      className={`badge-btn ${published ? "on" : "off"}`}
                      onClick={() => togglePublish(row)}
                      title="Переключить публикацию"
                    >
                      {published ? "Опубликовано" : "Черновик"}
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(row)}>
                    Изменить
                  </button>
                  {!def.fixed && (
                    <button className="btn btn-danger btn-sm" onClick={() => remove(row)}>
                      Удалить
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Форма записи ----
function RecordForm(props: {
  def: ResourceDef;
  record: any;
  menuItems: { id: number; label: string }[];
  onCancel: () => void;
  onSaved: () => void;
  onAuthError: () => void;
}) {
  return (
    <LangProvider>
      <FormBody {...props} />
    </LangProvider>
  );
}

function FormBody({
  def,
  record,
  menuItems,
  onCancel,
  onSaved,
  onAuthError,
}: {
  def: ResourceDef;
  record: any;
  menuItems: { id: number; label: string }[];
  onCancel: () => void;
  onSaved: () => void;
  onAuthError: () => void;
}) {
  const { lang } = useLang();
  const { et } = useT();
  const [row, setRow] = useState<any>(() => JSON.parse(JSON.stringify(record)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverProblems, setServerProblems] = useState<FieldProblem[] | null>(null);
  const isNew = !record.id;
  const ctx: FieldCtx = { menuItems, currentId: record.id ?? null };
  const pf = def.publishField;

  const set = (name: string, v: any) => setRow((r: any) => ({ ...r, [name]: v }));

  // клиентская проверка полноты переводов (зеркало серверной)
  const problems = validateRow(def, row);
  const canPublish = !problems.hasAny;

  // языки с незаполненными переводами (для подсветки вкладок)
  const warn: Record<Lang, boolean> = {
    ru: problems.byLang.ru.size > 0,
    tg: problems.byLang.tg.size > 0,
    en: problems.byLang.en.size > 0,
  };
  const warnLangsShort = LANGS.filter((l) => warn[l.code]).map((l) => l.short).join(", ");
  // недостающие языки конкретного поля (для подписи под полем)
  const missingFor = (name: string) => LANGS.filter((l) => problems.byLang[l.code].has(name)).map((l) => l.short);

  // статус записи определяется кнопкой (не автоматически по заполненности)
  const persistedPublished = pf ? !!record[pf] : false;

  async function save(publish: boolean) {
    setBusy(true);
    setError(null);
    setServerProblems(null);
    try {
      const payload: any = {};
      for (const f of def.fields) payload[f.name] = row[f.name];
      if (pf) payload[pf] = publish;
      if (isNew) await createResource(def.key, payload);
      else await updateResource(def.key, record.id, payload);
      onSaved();
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return onAuthError();
      if (e instanceof ApiError && e.status === 422 && e.fields) {
        setServerProblems(e.fields);
      }
      setError(et(e)); // локализованный текст ошибки (по коду API)
      setBusy(false);
    }
  }

  return (
    <>
      <div className="section-head">
        <div>
          <h1>{def.icon} {isNew ? "Новая запись" : "Редактирование"}</h1>
          <div className="muted">{def.label}</div>
        </div>
        <div className="spacer" />
        <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>Отмена</button>
        {pf ? (
          <>
            <button className="btn btn-ghost" onClick={() => save(false)} disabled={busy}>
              {persistedPublished ? "Снять с публикации" : "Сохранить черновик"}
            </button>
            <span title={!canPublish ? `Заполните переводы: ${warnLangsShort}` : undefined} style={{ display: "inline-flex" }}>
              <button className="btn btn-primary" onClick={() => save(true)} disabled={busy || !canPublish}>
                {persistedPublished ? "Сохранить опубликованным" : "Опубликовать"}
              </button>
            </span>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => save(false)} disabled={busy}>
            {busy ? "Сохранение…" : "Сохранить"}
          </button>
        )}
      </div>

      {pf && !canPublish && (
        <div className="alert" style={{ background: "#fff6e9", border: "1px solid #eecb92", color: "#8a5a12" }}>
          Кнопка «Опубликовать» недоступна: заполните переводы на всех языках{warnLangsShort ? ` (${warnLangsShort})` : ""}. Черновик можно сохранить в любой момент.
        </div>
      )}

      {error && (
        <div className="alert alert-err">
          {error}
          {serverProblems && (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {serverProblems.map((p, i) => (
                <li key={i}>{p.field} — {p.langs.map((l) => SHORT[l as Lang] || l).join(", ")}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="card card-pad">
        <div className="form-toolbar">
          <span className="muted" style={{ fontSize: 13 }}>Язык текстовых полей:</span>
          <LangTabs warn={warn} />
          {pf && (
            <span className={`badge ${persistedPublished ? "badge-on" : "badge-off"}`} style={{ marginLeft: "auto" }}>
              {persistedPublished ? "Опубликовано" : "Черновик"}
            </span>
          )}
        </div>

        <div className="field-grid">
          {def.fields.map((f) => {
            const miss = missingFor(f.name);
            const bad = miss.length > 0;
            return (
              <div key={f.name} className={f.full || f.type === "page-body" ? "col-full" : ""}>
                <label className="field-label" style={bad ? { color: "var(--danger)" } : undefined}>
                  {f.label}
                  {f.required && <span style={{ color: "var(--danger)" }}> *</span>}
                </label>
                {f.hint && <div className="hint" style={{ marginTop: -2, marginBottom: 6 }}>{f.hint}</div>}
                {f.type === "page-body" ? (
                  <PageBodyEditor slug={row.slug} value={row[f.name]} onChange={(v) => set(f.name, v)} ctx={ctx} />
                ) : (
                  <FieldEditor field={f} value={row[f.name]} onChange={(v) => set(f.name, v)} ctx={ctx} />
                )}
                {bad && (
                  <div className="hint" style={{ color: "var(--danger)", marginTop: 4 }}>
                    Нужен перевод: {miss.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ---- Редактор структурного тела страницы (по slug) ----
function PageBodyEditor({
  slug,
  value,
  onChange,
  ctx,
}: {
  slug: string;
  value: any;
  onChange: (v: any) => void;
  ctx: FieldCtx;
}) {
  const schema: Field[] | undefined = PAGE_BODY_SCHEMAS[slug];
  const obj = value && typeof value === "object" ? value : {};
  if (!schema) {
    return (
      <div>
        <div className="hint">Для этой страницы нет структурного редактора. Ниже — JSON-содержимое.</div>
        <textarea
          className="input"
          rows={10}
          value={JSON.stringify(obj, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              /* игнорируем невалидный промежуточный ввод */
            }
          }}
        />
      </div>
    );
  }
  const set = (name: string, v: any) => onChange({ ...obj, [name]: v });
  return (
    <div className="page-body-box">
      <div className="field-grid">
        {schema.map((f) => (
          <div key={f.name} className={f.full ? "col-full" : ""}>
            <label className="field-label">{f.label}</label>
            <FieldEditor field={f} value={obj[f.name]} onChange={(v) => set(f.name, v)} ctx={ctx} />
          </div>
        ))}
      </div>
    </div>
  );
}
