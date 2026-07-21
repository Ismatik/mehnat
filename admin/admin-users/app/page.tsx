"use client";

// Общая админка пользователей (SPA, статический экспорт).
// Одна страница: если нет сессии — экран входа; иначе — список пользователей.
// Доступ только для роли superadmin (проверяется и на клиенте, и в API).

import { useCallback, useEffect, useState } from "react";
import {
  listUsers,
  deleteUser,
  me,
  clearToken,
  getToken,
  ApiError,
  type SessionUser,
  type User,
} from "../lib/api";
import Login from "../components/Login";
import UserForm from "../components/UserForm";

const ROLE_LABEL: Record<string, string> = {
  superadmin: "Суперадмин",
  admin: "Администратор",
  editor: "Редактор",
};
const SITE_LABEL: Record<string, string> = { s1: "Сайт 1", s2: "Сайт 2" };

export default function Page() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<SessionUser | null>(null);

  // восстановление сессии по сохранённому токену
  useEffect(() => {
    if (!getToken()) {
      setBooting(false);
      return;
    }
    me()
      .then((u) => {
        if (u.role === "superadmin") setSession(u);
        else clearToken();
      })
      .catch(() => clearToken())
      .finally(() => setBooting(false));
  }, []);

  function logout() {
    clearToken();
    setSession(null);
  }

  if (booting) return <div className="spinner-note">Загрузка…</div>;
  if (!session) return <Login onSuccess={setSession} />;
  return <Dashboard session={session} onLogout={logout} />;
}

function Dashboard({ session, onLogout }: { session: SessionUser; onLogout: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        onLogout();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Не удалось загрузить список");
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    setFormOpen(true);
  }
  function onSaved() {
    setFormOpen(false);
    load();
  }

  async function remove(u: User) {
    if (u.id === session.id) return;
    if (!window.confirm(`Удалить пользователя ${u.email}? Действие необратимо.`)) return;
    try {
      await deleteUser(u.id);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Не удалось удалить");
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="container">
          <div className="brand">
            Пользователи
            <small>Общая административная панель · МЕХНАТ</small>
          </div>
          <div className="spacer" />
          <span className="who hide-sm">{session.email}</span>
          <button className="btn btn-light btn-sm" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div className="row" style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 24, color: "var(--primary)" }}>Список пользователей</h1>
          <div className="spacer" />
          <button className="btn btn-primary" onClick={openCreate}>
            + Новый пользователь
          </button>
        </div>

        {error && <div className="alert alert-err">{error}</div>}

        <div className="card">
          {loading ? (
            <div className="center-note">Загрузка списка…</div>
          ) : users.length === 0 ? (
            <div className="center-note">Пользователей пока нет.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Роль</th>
                  <th>Доступ</th>
                  <th>Статус</th>
                  <th style={{ textAlign: "right" }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.full_name || "—"}</div>
                      <div className="muted" style={{ fontSize: 13 }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === "superadmin" ? "badge-super" : "badge-role"}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {u.role === "superadmin" ? (
                          <span className="badge badge-site">Все сайты</span>
                        ) : u.site_access.length ? (
                          u.site_access.map((s) => (
                            <span key={s} className="badge badge-site">
                              {SITE_LABEL[s] ?? s}
                            </span>
                          ))
                        ) : (
                          <span className="muted" style={{ fontSize: 13 }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? "badge-on" : "badge-off"}`}>
                        {u.is_active ? "Активен" : "Отключён"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>
                        Изменить
                      </button>{" "}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(u)}
                        disabled={u.id === session.id}
                        title={u.id === session.id ? "Нельзя удалить самого себя" : "Удалить"}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {formOpen && <UserForm editing={editing} onClose={() => setFormOpen(false)} onSaved={onSaved} />}
    </>
  );
}
