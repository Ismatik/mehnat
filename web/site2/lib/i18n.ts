// Языки публичного сайта. Тексты приходят с API как JSONB {ru,tg,en}.
// Молчаливый fallback на ru: если перевод пуст — показываем ru без заглушек.

export type Lang = "ru" | "tg" | "en";

export const LANGS: { code: Lang; short: string; label: string }[] = [
  { code: "ru", short: "RU", label: "Русский" },
  { code: "tg", short: "ТҶ", label: "Тоҷикӣ" },
  { code: "en", short: "EN", label: "English" },
];

// pick — значение JSONB {ru,tg,en} или строка → строка на языке lang с откатом на ru.
export function pick(value: unknown, lang: Lang): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const o = value as Record<string, string>;
    return o[lang] || o.ru || o.tg || o.en || "";
  }
  return String(value);
}
