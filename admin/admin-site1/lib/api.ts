// Клиент общего Go-API для админки контента одного сайта.
// Сайт определяется ключом NEXT_PUBLIC_SITE_KEY (s1|s2) — он подставляется
// в путь /api/admin/{site}/... Токен админ-сессии хранится в localStorage.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";
export const SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY || "s1";
const TOKEN_KEY = `mehnat_admin_${SITE_KEY}_token`;

export type Role = "superadmin" | "admin" | "editor";

export interface SessionUser {
  id: number;
  email: string;
  full_name?: string;
  role: Role;
  site_access: string[];
}

export type Row = Record<string, any>;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  window.localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export interface FieldProblem {
  field: string;
  langs: string[];
}

export class ApiError extends Error {
  status: number;
  fields?: FieldProblem[]; // для 422 translation_incomplete
  code?: string;
  constructor(status: number, message: string, opts?: { fields?: FieldProblem[]; code?: string }) {
    super(message);
    this.status = status;
    this.fields = opts?.fields;
    this.code = opts?.code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (init.body) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Нет связи с сервером");
  }
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Ошибка ${res.status}`;
    throw new ApiError(res.status, msg, {
      fields: data && Array.isArray(data.fields) ? data.fields : undefined,
      code: data && typeof data.error === "string" ? data.error : undefined,
    });
  }
  return data as T;
}

// ---- Аутентификация ----
export async function login(email: string, password: string) {
  const data = await request<{ token: string; user: SessionUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}
export function me() {
  return request<SessionUser>("/auth/me");
}

const adm = (p: string) => `/admin/${SITE_KEY}${p}`;

// ---- Ресурсы (обобщённый CRUD) ----
export function listResource(resource: string) {
  return request<Row[]>(adm(`/${resource}`));
}
export function createResource(resource: string, body: Row) {
  return request<Row>(adm(`/${resource}`), { method: "POST", body: JSON.stringify(body) });
}
export function updateResource(resource: string, id: number, body: Row) {
  return request<Row>(adm(`/${resource}/${id}`), { method: "PUT", body: JSON.stringify(body) });
}
export function deleteResource(resource: string, id: number) {
  return request<void>(adm(`/${resource}/${id}`), { method: "DELETE" });
}

// ---- Настройки ----
export function getSettings() {
  return request<Record<string, any>>(adm(`/settings`));
}
export function putSetting(key: string, value: any) {
  return request<Row>(adm(`/settings/${key}`), { method: "PUT", body: JSON.stringify(value) });
}

// ---- Заявки с формы ----
export function listMessages() {
  return request<Row[]>(adm(`/contact_messages`));
}
export function markMessageRead(id: number, isRead: boolean) {
  return request<Row>(adm(`/contact_messages/${id}`), {
    method: "PUT",
    body: JSON.stringify({ is_read: isRead }),
  });
}
export function deleteMessage(id: number) {
  return request<void>(adm(`/contact_messages/${id}`), { method: "DELETE" });
}

// ---- Загрузка файлов ----
export async function uploadFile(file: File): Promise<{ url: string; filename: string }> {
  const form = new FormData();
  form.append("file", file);
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${adm("/upload")}`, { method: "POST", headers, body: form });
  } catch {
    throw new ApiError(0, "Нет связи с сервером");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, (data && data.error) || "Ошибка загрузки");
  return data;
}

// Абсолютный URL для превью загруженного файла (в проде /api уже на том же origin).
export function assetUrl(u: string): string {
  return u || "";
}
