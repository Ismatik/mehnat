"use client";

// Заявки с формы «Связаться с нами»: чтение, пометка прочитанным, удаление.

import { useCallback, useEffect, useState } from "react";
import { listMessages, markMessageRead, deleteMessage, ApiError } from "../lib/api";

export default function MessagesSection({ onAuthError }: { onAuthError: () => void }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listMessages());
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return onAuthError();
      setError(e instanceof ApiError ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRead(m: any) {
    try {
      await markMessageRead(m.id, !m.is_read);
      setRows((rs) => rs.map((r) => (r.id === m.id ? { ...r, is_read: !r.is_read } : r)));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Ошибка");
    }
  }
  async function remove(m: any) {
    if (!window.confirm("Удалить заявку?")) return;
    try {
      await deleteMessage(m.id);
      setRows((rs) => rs.filter((r) => r.id !== m.id));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Ошибка удаления");
    }
  }

  const fmt = (s: string) => {
    if (!s) return "";
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleString("ru-RU");
  };
  const unread = rows.filter((r) => !r.is_read).length;

  return (
    <div>
      <div className="section-head">
        <div>
          <h1>✉️ Заявки с сайта</h1>
          <div className="muted">Всего {rows.length}{unread ? `, новых ${unread}` : ""}</div>
        </div>
      </div>

      {error && <div className="alert alert-err">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="center-note">Загрузка…</div>
        ) : rows.length === 0 ? (
          <div className="center-note">Заявок пока нет.</div>
        ) : (
          <div className="list">
            {rows.map((m) => (
              <div key={m.id} className={`msg-row ${m.is_read ? "" : "unread"}`}>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 10 }}>
                    {!m.is_read && <span className="dot" />}
                    <strong>{m.name || "Без имени"}</strong>
                    {m.phone && <span className="muted">· {m.phone}</span>}
                    {m.email && <span className="muted">· {m.email}</span>}
                  </div>
                  <div style={{ margin: "6px 0", whiteSpace: "pre-wrap" }}>{m.message}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>
                    {fmt(m.created_at)}{m.source_page ? ` · страница: ${m.source_page}` : ""}
                  </div>
                </div>
                <div className="stack" style={{ gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleRead(m)}>
                    {m.is_read ? "В непрочит." : "Прочитано"}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(m)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
