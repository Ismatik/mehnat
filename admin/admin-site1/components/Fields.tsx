"use client";

// Рекурсивный движок редактирования полей. Тип поля → нужный редактор.
// Все трилингвал-поля разделяют один переключатель языка на форму (LangContext).

import { createContext, useContext, useState } from "react";
import { LANGS, type Lang, emptyI18n, type I18n } from "../lib/i18n";
import { uploadFile, ApiError } from "../lib/api";
import type { Field } from "../lib/schema";
import { emptyValue } from "../lib/schema";
import CropModal from "./CropModal";

// ---- Общий язык формы ----
const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ru",
  setLang: () => {},
});
export function useLang() {
  return useContext(LangCtx);
}
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}
export function LangTabs({ warn }: { warn?: Partial<Record<Lang, boolean>> }) {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-tabs">
      {LANGS.map((l) => {
        const w = warn && warn[l.code];
        return (
          <button
            key={l.code}
            type="button"
            className={`lang-tab ${lang === l.code ? "active" : ""} ${w ? "warn" : ""}`}
            onClick={() => setLang(l.code)}
            title={w ? "Есть незаполненные переводы" : undefined}
          >
            {l.label}
            {w && <span className="lang-warn-dot" />}
          </button>
        );
      })}
    </div>
  );
}

// ---- Контекст для меню-родителя ----
export interface FieldCtx {
  menuItems?: { id: number; label: string }[];
  currentId?: number | null;
}

// ---- Трилингвал ----
function I18nInput({
  value,
  onChange,
  multiline,
}: {
  value: I18n;
  onChange: (v: I18n) => void;
  multiline?: boolean;
}) {
  const { lang } = useLang();
  const v = value || emptyI18n();
  const set = (s: string) => onChange({ ...v, [lang]: s });
  return multiline ? (
    <textarea className="input" rows={4} value={v[lang] ?? ""} onChange={(e) => set(e.target.value)} />
  ) : (
    <input className="input" value={v[lang] ?? ""} onChange={(e) => set(e.target.value)} />
  );
}

// ---- Изображение ----
function ImageInput({ value, onChange, aspect, label }: { value: string; onChange: (v: string) => void; aspect?: number; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    // изображения → редактор обрезки; прочее (напр. PDF) грузим как есть
    if (file.type.startsWith("image/") && aspect) {
      setCropFile(file);
    } else {
      upload(file);
    }
  }

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const { url } = await uploadFile(file, label);
      onChange(url);
    } catch (x) {
      setErr(x instanceof ApiError ? x.message : "Ошибка загрузки");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="image-row">
        {value ? (
          <img className="image-preview" src={value} alt="" />
        ) : (
          <div className="image-preview empty">нет фото</div>
        )}
        <div style={{ flex: 1 }}>
          <input className="input" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="URL или загрузите файл" />
          <div className="image-actions">
            <label className="btn btn-ghost btn-sm">
              {busy ? "Загрузка…" : "Загрузить файл"}
              <input type="file" accept="image/*,.pdf" hidden onChange={pick} disabled={busy} />
            </label>
            {value && (
              <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange("")}>
                Убрать
              </button>
            )}
          </div>
          {err && <div className="hint" style={{ color: "var(--danger)" }}>{err}</div>}
        </div>
      </div>
      {cropFile && (
        <CropModal
          file={cropFile}
          aspect={aspect || 1}
          onCancel={() => setCropFile(null)}
          onConfirm={(f) => {
            setCropFile(null);
            upload(f);
          }}
        />
      )}
    </div>
  );
}

// ---- Галерея / коллаж ----
function GalleryInput({ value, onChange, aspect, label }: { value: string[]; onChange: (v: string[]) => void; aspect?: number; label?: string }) {
  const list = Array.isArray(value) ? value : [];
  const setAt = (i: number, u: string) => onChange(list.map((x, k) => (k === i ? u : x)));
  const add = () => onChange([...list, ""]);
  const remove = (i: number) => onChange(list.filter((_, k) => k !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const cp = [...list];
    [cp[i], cp[j]] = [cp[j], cp[i]];
    onChange(cp);
  };
  return (
    <div className="stack" style={{ gap: 10 }}>
      {list.map((u, i) => (
        <div key={i} className="item-card">
          <div className="item-head">
            <span className="item-num">{i + 1}</span>
            <div className="spacer" />
            <button type="button" className="mini" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button type="button" className="mini" onClick={() => move(i, 1)} disabled={i === list.length - 1}>↓</button>
            <button type="button" className="mini danger" onClick={() => remove(i)}>✕</button>
          </div>
          <ImageInput value={u} onChange={(x) => setAt(i, x)} aspect={aspect} label={label} />
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={add}>+ Добавить изображение</button>
    </div>
  );
}

// ---- Список трилингвал-строк ----
function I18nListInput({
  value,
  onChange,
  itemLabel,
}: {
  value: I18n[];
  onChange: (v: I18n[]) => void;
  itemLabel?: string;
}) {
  const list = Array.isArray(value) ? value : [];
  const setAt = (i: number, v: I18n) => onChange(list.map((x, k) => (k === i ? v : x)));
  const add = () => onChange([...list, emptyI18n()]);
  const remove = (i: number) => onChange(list.filter((_, k) => k !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const cp = [...list];
    [cp[i], cp[j]] = [cp[j], cp[i]];
    onChange(cp);
  };
  return (
    <div className="stack" style={{ gap: 10 }}>
      {list.map((v, i) => (
        <div key={i} className="item-card">
          <div className="item-head">
            <span className="item-num">{(itemLabel || "Пункт") + " " + (i + 1)}</span>
            <div className="spacer" />
            <button type="button" className="mini" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button type="button" className="mini" onClick={() => move(i, 1)} disabled={i === list.length - 1}>↓</button>
            <button type="button" className="mini danger" onClick={() => remove(i)}>✕</button>
          </div>
          <I18nInput value={v} onChange={(x) => setAt(i, x)} multiline />
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={add}>+ Добавить</button>
    </div>
  );
}

// ---- Массив объектов ----
function RepeaterInput({
  value,
  onChange,
  itemSchema,
  itemLabel,
  ctx,
}: {
  value: any[];
  onChange: (v: any[]) => void;
  itemSchema: Field[];
  itemLabel?: string;
  ctx: FieldCtx;
}) {
  const list = Array.isArray(value) ? value : [];
  const newItem = () => {
    const o: any = {};
    for (const f of itemSchema) o[f.name] = emptyValue(f);
    return o;
  };
  const setAt = (i: number, v: any) => onChange(list.map((x, k) => (k === i ? v : x)));
  const add = () => onChange([...list, newItem()]);
  const remove = (i: number) => onChange(list.filter((_, k) => k !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const cp = [...list];
    [cp[i], cp[j]] = [cp[j], cp[i]];
    onChange(cp);
  };
  return (
    <div className="stack" style={{ gap: 12 }}>
      {list.map((item, i) => (
        <div key={i} className="item-card">
          <div className="item-head">
            <span className="item-num">{(itemLabel || "Элемент") + " " + (i + 1)}</span>
            <div className="spacer" />
            <button type="button" className="mini" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button type="button" className="mini" onClick={() => move(i, 1)} disabled={i === list.length - 1}>↓</button>
            <button type="button" className="mini danger" onClick={() => remove(i)}>✕</button>
          </div>
          <ObjectInput value={item} onChange={(x) => setAt(i, x)} itemSchema={itemSchema} ctx={ctx} />
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={add}>+ Добавить {itemLabel?.toLowerCase()}</button>
    </div>
  );
}

// ---- Один вложенный объект ----
function ObjectInput({
  value,
  onChange,
  itemSchema,
  ctx,
}: {
  value: any;
  onChange: (v: any) => void;
  itemSchema: Field[];
  ctx: FieldCtx;
}) {
  const obj = value && typeof value === "object" ? value : {};
  const setField = (name: string, v: any) => onChange({ ...obj, [name]: v });
  return (
    <div className="field-grid">
      {itemSchema.map((f) => (
        <div key={f.name} className={f.full ? "col-full" : ""}>
          <label className="field-label">{f.label}</label>
          <FieldEditor field={f} value={obj[f.name]} onChange={(v) => setField(f.name, v)} ctx={ctx} />
        </div>
      ))}
    </div>
  );
}

// ---- Диспетчер по типу поля ----
export function FieldEditor({
  field,
  value,
  onChange,
  ctx,
}: {
  field: Field;
  value: any;
  onChange: (v: any) => void;
  ctx: FieldCtx;
}) {
  switch (field.type) {
    case "i18n":
      return <I18nInput value={value} onChange={onChange} />;
    case "i18n-text":
      return <I18nInput value={value} onChange={onChange} multiline />;
    case "text":
      return (
        <input
          className="input"
          value={value ?? ""}
          readOnly={field.readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "textarea":
      return <textarea className="input" rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "color":
      return (
        <div className="row" style={{ gap: 10 }}>
          <input type="color" value={value || "#0b3b6b"} onChange={(e) => onChange(e.target.value)} style={{ width: 46, height: 38, border: "1px solid var(--border-strong)", borderRadius: 6, background: "#fff" }} />
          <input className="input" style={{ maxWidth: 160 }} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "int":
      return (
        <input
          className="input"
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        />
      );
    case "bool":
      return (
        <label className="check">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          {value ? "Да" : "Нет"}
        </label>
      );
    case "datetime": {
      // value — ISO строка или ''. input datetime-local без секунд.
      const local = value ? String(value).slice(0, 16) : "";
      return (
        <input
          className="input"
          type="datetime-local"
          value={local}
          onChange={(e) => onChange(e.target.value ? e.target.value : null)}
        />
      );
    }
    case "image":
      return <ImageInput value={value ?? ""} onChange={onChange} aspect={field.aspect} label={field.label} />;
    case "gallery":
      return <GalleryInput value={value} onChange={onChange} aspect={field.aspect} label={field.label} />;
    case "i18n-list":
      return <I18nListInput value={value} onChange={onChange} itemLabel={field.itemLabel} />;
    case "repeater":
      return (
        <RepeaterInput
          value={value}
          onChange={onChange}
          itemSchema={field.itemSchema || []}
          itemLabel={field.itemLabel}
          ctx={ctx}
        />
      );
    case "object":
      return <ObjectInput value={value} onChange={onChange} itemSchema={field.itemSchema || []} ctx={ctx} />;
    case "menu-parent":
      return (
        <select
          className="select"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
        >
          <option value="">— (верхний уровень)</option>
          {(ctx.menuItems || [])
            .filter((m) => m.id !== ctx.currentId)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
        </select>
      );
    default:
      return <input className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}
