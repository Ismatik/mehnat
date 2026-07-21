// Клиент общего Go-API для админки пользователей.
// Статический экспорт: всё исполняется в браузере, токен — в localStorage.
// Адрес API инлайнится на этапе сборки из NEXT_PUBLIC_API_BASE (в проде "/api").

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";
const TOKEN_KEY = "mehnat_users_token";

export type Role = "superadmin" | "admin" | "editor";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  site_access: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SessionUser {
  id: number;
  email: string;
  full_name?: string;
  role: Role;
  site_access: string[];
}

export interface UserPayload {
  email: string;
  full_name: string;
  role: Role;
  site_access: string[];
  is_active: boolean;
  password?: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

// Ошибка API с человекочитаемым сообщением и HTTP-статусом.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
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
    const msg = (data && (data.error || data.message)) || `Ошибка ${res.status}`;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

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

export function listUsers() {
  return request<User[]>("/admin/users");
}

export function createUser(payload: UserPayload) {
  return request<User>("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: number, payload: Partial<UserPayload>) {
  return request<User>(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: number) {
  return request<void>(`/admin/users/${id}`, { method: "DELETE" });
}
