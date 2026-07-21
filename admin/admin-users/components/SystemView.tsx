"use client";

// Системный статус (только superadmin): живость БД, место на диске, последний
// успешный бэкап, статус контейнеров. Только чтение, автообновление каждые 20 с.

import { useCallback, useEffect, useState } from "react";
import { getSystemStatus, ApiError, type Row } from "../lib/api";

function fmtBytes(n: number): string {
  if (!n || n < 0) return "0 Б";
  const u = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
}

function fmtTs(ts: string): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? ts : d.toLocaleString("ru-RU");
}

function fmtAge(hours: number): string {
  if (hours == null) return "";
  if (hours < 1) return `${Math.round(hours * 60)} мин назад`;
  if (hours < 48) return `${Math.round(hours)} ч назад`;
  return `${Math.round(hours / 24)} дн назад`;
}

// Светофор для строки БД / бэкапа / контейнера.
function Dot({ tone }: { tone: "ok" | "warn" | "err" | "off" }) {
  const color = tone === "ok" ? "#1a9e5f" : tone === "warn" ? "#d9a300" : tone === "err" ? "#d33" : "#9aa";
  return <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color, flex: "0 0 auto" }} />;
}

export default function SystemView({ onAuthError }: { onAuthError: () => void }) {
  const [data, setData] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await getSystemStatus());
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return onAuthError();
      setError(e instanceof ApiError ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  if (loading) return <div className="center-note">Загрузка статуса…</div>;
  if (error) return <div className="alert alert-err">{error}</div>;
  if (!data) return null;

  const db: Row = data.db || {};
  const disks: Row[] = Array.isArray(data.disk) ? data.disk : [];
  const backup: Row = data.backup || {};
  const containers: Row = data.containers || {};
  const items: Row[] = Array.isArray(containers.items) ? containers.items : [];

  // Бэкап: тревога если старше 26 ч (пропущен ежедневный) или дампов нет.
  const backupTone: "ok" | "warn" | "err" =
    !backup.available ? "err" : (backup.count ?? 0) === 0 ? "warn" : (backup.age_hours ?? 0) > 26 ? "warn" : "ok";

  return (
    <div>
      <div className="row" style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22 }}>Система</h1>
        <div className="spacer" />
        <button className="btn btn-ghost btn-sm" onClick={load}>Обновить</button>
      </div>

      <div className="dash-grid">
        {/* База данных */}
        <div className="card card-pad">
          <h2 className="dash-h2">База данных</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Dot tone={db.ok ? "ok" : "err"} />
            <strong>{db.ok ? "Доступна" : "Недоступна"}</strong>
            {db.ok && <span className="muted" style={{ fontSize: 13 }}>отклик {db.latency_ms} мс</span>}
          </div>
          {db.ok ? (
            <table className="dash-table">
              <tbody>
                <tr><td className="muted">Версия</td><td style={{ fontWeight: 600 }}>{db.version || "—"}</td></tr>
                <tr><td className="muted">Размер БД</td><td style={{ fontWeight: 600 }}>{db.size || "—"}</td></tr>
              </tbody>
            </table>
          ) : (
            <div className="muted" style={{ fontSize: 13 }}>{db.error || "Нет соединения"}</div>
          )}
        </div>

        {/* Последний бэкап */}
        <div className="card card-pad">
          <h2 className="dash-h2">Резервная копия</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Dot tone={backupTone} />
            <strong>
              {!backup.available ? "Каталог недоступен" : (backup.count ?? 0) === 0 ? "Дампов пока нет" : "Есть свежая копия"}
            </strong>
          </div>
          {backup.available && (backup.count ?? 0) > 0 && (
            <table className="dash-table">
              <tbody>
                <tr><td className="muted">Последний дамп</td><td style={{ fontWeight: 600 }}>{fmtTs(backup.last_time)} <span className="muted">({fmtAge(backup.age_hours)})</span></td></tr>
                <tr><td className="muted">Файл</td><td style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 12.5 }}>{backup.last_file}</td></tr>
                <tr><td className="muted">Размер</td><td style={{ fontWeight: 600 }}>{fmtBytes(backup.last_size)}</td></tr>
                <tr><td className="muted">Всего копий</td><td style={{ fontWeight: 600 }}>{backup.count}</td></tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Диск */}
      <div className="card card-pad" style={{ marginTop: 18 }}>
        <h2 className="dash-h2">Дисковое пространство</h2>
        {disks.length === 0 ? (
          <div className="muted" style={{ fontSize: 13 }}>Нет данных.</div>
        ) : (
          disks.map((d) => {
            const pct = d.ok ? (d.used_pct ?? 0) : 0;
            const tone = pct >= 90 ? "#d33" : pct >= 75 ? "#d9a300" : "#1a9e5f";
            return (
              <div key={d.path} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontFamily: "monospace" }}>{d.path}</span>
                  {d.ok ? (
                    <span className="muted">{fmtBytes(d.used)} из {fmtBytes(d.total)} · свободно {fmtBytes(d.free)}</span>
                  ) : (
                    <span style={{ color: "#d33" }}>недоступен</span>
                  )}
                </div>
                {d.ok && (
                  <div style={{ height: 9, borderRadius: 5, background: "#eceef1", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: tone }} />
                  </div>
                )}
                {d.ok && <div style={{ fontSize: 12, color: tone, marginTop: 3, fontWeight: 700 }}>{pct}% занято</div>}
              </div>
            );
          })
        )}
      </div>

      {/* Контейнеры */}
      <div className="card card-pad" style={{ marginTop: 18 }}>
        <h2 className="dash-h2">Контейнеры</h2>
        {!containers.available ? (
          <div className="muted" style={{ fontSize: 13 }}>
            Статус контейнеров недоступен (docker-сокет не примонтирован к API).
          </div>
        ) : items.length === 0 ? (
          <div className="muted" style={{ fontSize: 13 }}>Контейнеры не найдены.</div>
        ) : (
          <table className="dash-table">
            <thead><tr><th></th><th>Сервис</th><th>Состояние</th><th>Статус</th></tr></thead>
            <tbody>
              {items.map((c) => {
                const running = c.state === "running";
                const tone: "ok" | "warn" | "err" =
                  c.health === "unhealthy" ? "err" : c.health === "starting" ? "warn" : running ? "ok" : "err";
                return (
                  <tr key={c.name}>
                    <td style={{ width: 22 }}><Dot tone={tone} /></td>
                    <td style={{ fontWeight: 700 }}>{c.service || c.name}</td>
                    <td>{c.state}</td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{c.status}{c.health ? ` · ${c.health}` : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
        Обновлено: {fmtTs(data.now)} · автообновление каждые 20 с
      </div>
    </div>
  );
}
