// Публичный клиент Go-API. Всё исполняется в браузере (статический экспорт).
// Читаем только опубликованный/активный контент через /public/{site}/...

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";
export const SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY || "s1";
export const ATS_URL = process.env.NEXT_PUBLIC_ATS_URL || "";

export type Row = Record<string, any>;

const pub = (p: string) => `${API_BASE}/public/${SITE_KEY}${p}`;

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export function getSettings() {
  return getJSON<Record<string, any>>(pub("/settings"));
}
export function listResource(resource: string) {
  return getJSON<Row[]>(pub(`/${resource}`));
}
export function getBySlug(resource: string, slug: string) {
  return getJSON<Row>(pub(`/${resource}/${encodeURIComponent(slug)}`));
}

export async function sendContact(input: {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  source_page?: string;
}): Promise<void> {
  const res = await fetch(pub("/contact_messages"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => null);
    throw new Error((d && (d.error || d.message)) || `HTTP ${res.status}`);
  }
}

// Значение настройки как строка/объект (JSONB может быть строкой или {ru,tg,en}).
export function setting(settings: Record<string, any>, key: string): any {
  return settings ? settings[key] : undefined;
}
