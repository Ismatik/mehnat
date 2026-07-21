// Клиентское зеркало серверного валидатора публикации (translation_incomplete).
// Правило МЯГКОЕ: частичный перевод (заполнено на одном языке, пусто на другом)
// блокирует публикацию; полностью пустое необязательное поле — нет; поля с
// required обязаны быть на всех трёх языках.

import type { Lang } from "./i18n";
import type { ResourceDef, Field } from "./schema";

const L3: Lang[] = ["ru", "tg", "en"];

function isI18n(o: any): boolean {
  if (!o || typeof o !== "object" || Array.isArray(o)) return false;
  const keys = Object.keys(o);
  if (keys.length === 0) return false;
  return keys.every((k) => k === "ru" || k === "tg" || k === "en");
}

function emptyLangs(o: any): Lang[] {
  return L3.filter((l) => {
    const v = o ? o[l] : undefined;
    return typeof v !== "string" || v.trim() === "";
  });
}

// Рекурсивный обход значения (мягкое правило). add(l) вызывается для каждого
// языка, где обнаружен незаполненный перевод.
function scan(value: any, add: (l: Lang) => void) {
  if (isI18n(value)) {
    const empty = emptyLangs(value);
    if (empty.length > 0 && empty.length < 3) empty.forEach(add);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => scan(v, add));
    return;
  }
  if (value && typeof value === "object") {
    for (const k of Object.keys(value)) scan(value[k], add);
  }
}

export interface I18nProblems {
  byLang: Record<Lang, Set<string>>; // имена полей с проблемой на каждом языке
  fields: Set<string>; // поля с проблемой (на любом языке)
  hasAny: boolean;
}

export function validateRow(def: ResourceDef, row: any): I18nProblems {
  const byLang: Record<Lang, Set<string>> = { ru: new Set(), tg: new Set(), en: new Set() };
  const fields = new Set<string>();
  const mark = (name: string) => (l: Lang) => {
    byLang[l].add(name);
    fields.add(name);
  };
  for (const f of def.fields as Field[]) {
    if (f.required) {
      // строго: пусто на любом языке (в т.ч. пусто-везде) — проблема
      emptyLangs(row ? row[f.name] : undefined).forEach(mark(f.name));
    } else {
      scan(row ? row[f.name] : undefined, mark(f.name));
    }
  }
  return { byLang, fields, hasAny: fields.size > 0 };
}
