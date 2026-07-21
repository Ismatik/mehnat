"use client";

// Дашборд суперадмина: заявки и опубликованные новости по сайтам, число
// пользователей, активность редакторов за 7 дней, последние действия. Только чтение.

import { useCallback, useEffect, useState } from "react";
import { getDashboard, ApiError, type Row } from "../lib/api";
import { phrase, SITE_LABEL } from "../lib/auditdict";

function fmtTs(ts: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? ts : d.toLocaleString("ru-RU");
}

function Card({ title, value, sub }: { title: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="card card-pad dash-card">
      <div className="dash-num">{value}</div>
      <div className="dash-title">{title}</div>
      {sub && <div className="dash-sub">{sub}</div>}
    </div>
  );
}

export default function DashboardView({ onAuthError }: { onAuthError: () => void }) {
  const [data, setData] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getDashboard());
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return onAuthError();
      setError(e instanceof ApiError ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="center-note">Загрузка сводки…</div>;
  if (error) return <div className="alert alert-err">{error}</div>;
  if (!data) return null;

  const sites: Row[] = Array.isArray(data.sites) ? data.sites : [];
  const activity: Row[] = Array.isArray(data.activity) ? data.activity : [];
  const recent: Row[] = Array.isArray(data.recent) ? data.recent : [];
  const msgTotal = sites.reduce((a, s) => a + (s.messages_total || 0), 0);
  const msgUnread = sites.reduce((a, s) => a + (s.messages_unread || 0), 0);

  return (
    <div>
      <div className="row" style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22 }}>Сводка</h1>
        <div className="spacer" />
        <button className="btn btn-ghost btn-sm" onClick={load}>Обновить</button>
      </div>

      {/* карточки */}
      <div className="dash-cards">
        <Card title="Пользователей" value={data.users?.total ?? 0} sub={`активных ${data.users?.active ?? 0}`} />
        <Card title="Заявок всего" value={msgTotal} />
        <Card title="Новых заявок" value={msgUnread} sub={msgUnread ? "требуют внимания" : "все прочитаны"} />
      </div>

      <div className="dash-grid">
        {/* по сайтам */}
        <div className="card card-pad">
          <h2 className="dash-h2">По сайтам</h2>
          <table className="dash-table">
            <thead><tr><th>Сайт</th><th>Заявки</th><th>Новых</th><th>Новостей опубл.</th></tr></thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.site}>
                  <td style={{ fontWeight: 700 }}>{SITE_LABEL[s.site] || s.site}</td>
                  <td>{s.messages_total ?? 0}</td>
                  <td>{s.messages_unread ? <span className="badge badge-super">{s.messages_unread}</span> : 0}</td>
                  <td>{s.news_published ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* активность редакторов */}
        <div className="card card-pad">
          <h2 className="dash-h2">Активность за 7 дней</h2>
          {activity.length === 0 ? (
            <div className="muted" style={{ fontSize: 13 }}>Действий за неделю нет.</div>
          ) : (
            <table className="dash-table">
              <thead><tr><th>Пользователь</th><th>Действий</th></tr></thead>
              <tbody>
                {activity.map((a) => (
                  <tr key={a.actor_email}><td>{a.actor_email}</td><td style={{ fontWeight: 700 }}>{a.count}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* последние действия */}
      <div className="card card-pad" style={{ marginTop: 18 }}>
        <h2 className="dash-h2">Последние действия</h2>
        {recent.length === 0 ? (
          <div className="muted" style={{ fontSize: 13 }}>Записей нет.</div>
        ) : (
          <div className="dash-recent">
            {recent.map((r) => (
              <div key={r.id} className="dash-recent-row">
                <span className={`act-dot act-${r.action}`} />
                <span style={{ flex: 1 }}>{phrase(r)}</span>
                <span className="muted" style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>{fmtTs(r.ts)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
