// Языки контента. Все текстовые поля хранятся как JSONB {ru,tg,en}.

export type Lang = "ru" | "tg" | "en";

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "ru", label: "Русский", short: "RU" },
  { code: "tg", label: "Тоҷикӣ", short: "ТҶ" },
  { code: "en", label: "English", short: "EN" },
];

export type I18n = Partial<Record<Lang, string>>;

// Пустой трилингвал.
export function emptyI18n(): I18n {
  return { ru: "", tg: "", en: "" };
}

// Приводит значение к объекту {ru,tg,en}: строку кладёт во все языки-заглушки.
export function toI18n(v: unknown): I18n {
  if (v && typeof v === "object") return v as I18n;
  if (typeof v === "string") return { ru: v, tg: v, en: v };
  return emptyI18n();
}

// Локализация: строка или {ru,tg,en} → строка на выбранном языке (с откатом на ru).
export function localize(v: unknown, lang: Lang = "ru"): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const o = v as I18n;
    return o[lang] || o.ru || o.tg || o.en || "";
  }
  return "";
}
