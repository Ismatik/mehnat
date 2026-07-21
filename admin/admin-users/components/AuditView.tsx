"use client";

// Общий журнал аудита (superadmin): ВСЕ логи. Каждая строка — фраза; клик →
// детали (diff-таблица + техданные). Только чтение.

import { useCallback, useEffect, useMemo, useState } from "react";
import { listAudit, ApiError, type Row } from "../lib/api";
import { phrase, fieldLabel, fmtValue, isHex, ACTION_WORD, RESOURCE_LABEL } from "../lib/auditdict";

function fmtTs(ts: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? ts : d.toLocaleString("ru-RU");
}

function ValueCell({ field, v }: { field: string; v: any }) {
  const text = fmtValue(field, v);
  if (isHex(v)) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 14, height: 14, borderRadius: 3, background: v, border: "1px solid #ccc", display: "inline-block" }} />
        {text}
      </span>
    );
  }
  return <>{text}</>;
}

const ALL_ACTIONS = ["create", "update", "delete", "publish", "unpublish", "upload", "login", "login_failed", "logout", "user_create", "user_update", "user_delete"];

export default function AuditView({ onAuthError }: { onAuthError: () => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);
  const [f, setF] = useState({ actor: "", action: "", resource: "", site: "", ip: "", from: "", to: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listAudit(f));
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return onAuthError();
      setError(e instanceof ApiError ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAuthError, JSON.stringify(f)]);

  useEffect(() => { load(); }, [load]);

  const exportRows = useMemo(
    () => rows.map((r) => ({
      "Дата-время": fmtTs(r.ts),
      Действие: phrase(r),
      Кто: r.actor_email || "",
      Сайт: r.site || "",
      Раздел: r.resource || "",
      Запись: r.page_label || (r.record_id ? `#${r.record_id}` : ""),
      IP: r.ip || "",
    })),
    [rows]
  );

  function downloadBlob(content: string, name: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }
  function exportCSV() {
    if (!exportRows.length) return;
    const headers = Object.keys(exportRows[0]);
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const csv = [headers.join(";"), ...exportRows.map((r) => headers.map((h) => esc((r as any)[h])).join(";"))].join("\n");
    downloadBlob("﻿" + csv, "audit.csv", "text/csv;charset=utf-8");
  }
  async function exportXLSX() {
    if (!exportRows.length) return;
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Логи");
    XLSX.writeFile(wb, "audit.xlsx");
  }

  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  const hasFilters = f.actor || f.action || f.resource || f.site || f.ip || f.from || f.to;

  return (
    <div>
      <div className="row" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22 }}>Журнал аудита</h1>
        <span className="muted" style={{ marginLeft: 10 }}>· {rows.length}</span>
        <div className="spacer" />
        <button className="btn btn-ghost btn-sm" onClick={exportCSV} disabled={!rows.length}>Экспорт CSV</button>{" "}
        <button className="btn btn-ghost btn-sm" onClick={exportXLSX} disabled={!rows.length}>Экспорт Excel</button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <label className="field"><span>Пользователь</span><input className="input" value={f.actor} onChange={(e) => set("actor", e.target.value)} placeholder="почта…" /></label>
          <label className="field"><span>Действие</span>
            <select className="select" value={f.action} onChange={(e) => set("action", e.target.value)}>
              <option value="">все</option>
              {ALL_ACTIONS.map((k) => <option key={k} value={k}>{ACTION_WORD[k] || k}</option>)}
            </select>
          </label>
          <label className="field"><span>Раздел</span>
            <select className="select" value={f.resource} onChange={(e) => set("resource", e.target.value)}>
              <option value="">все</option>
              {Object.entries(RESOURCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="field"><span>Сайт</span>
            <select className="select" value={f.site} onChange={(e) => set("site", e.target.value)}>
              <option value="">все</option><option value="s1">Сайт 1</option><option value="s2">Сайт 2</option>
            </select>
          </label>
          <label className="field"><span>IP</span><input className="input" value={f.ip} onChange={(e) => set("ip", e.target.value)} /></label>
          <label className="field"><span>С даты</span><input className="input" type="datetime-local" value={f.from} onChange={(e) => set("from", e.target.value)} /></label>
          <label className="field"><span>По дату</span><input className="input" type="datetime-local" value={f.to} onChange={(e) => set("to", e.target.value)} /></label>
        </div>
        {hasFilters && <button className="btn btn-ghost btn-sm" onClick={() => setF({ actor: "", action: "", resource: "", site: "", ip: "", from: "", to: "" })}>Сбросить фильтры</button>}
      </div>

      {error && <div className="alert alert-err">{error}</div>}

      <div className="card">
        {loading ? <div className="center-note">Загрузка…</div> : rows.length === 0 ? <div className="center-note">Записей нет.</div> : (
          <table className="audit-table">
            <thead><tr><th>Действие</th><th>Сайт</th><th>Дата-время</th><th>IP</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="clk" onClick={() => setDetail(r)}>
                  <td><span className={`act-dot act-${r.action}`} /> {phrase(r)}</td>
                  <td className="muted">{r.site || "—"}</td>
                  <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmtTs(r.ts)}</td>
                  <td className="muted" style={{ whiteSpace: "nowrap" }}>{r.ip || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detail && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal">
            <div className="modal-head"><h2>Детали действия</h2><div className="spacer" /><button className="close-x" onClick={() => setDetail(null)}>×</button></div>
            <div className="modal-body">
              <div style={{ fontWeight: 700, marginBottom: 12 }}>{phrase(detail)}</div>
              <table className="meta-table">
                <tbody>
                  <tr><td>Время</td><td>{fmtTs(detail.ts)}</td></tr>
                  <tr><td>Пользователь</td><td>{detail.actor_email || "—"}</td></tr>
                  <tr><td>Сайт</td><td>{detail.site || "—"}</td></tr>
                  <tr><td>Раздел</td><td>{detail.resource || "—"}</td></tr>
                  <tr><td>Запись</td><td>{detail.page_label || "—"}{detail.record_id ? ` · ID ${detail.record_id}` : ""}</td></tr>
                  <tr><td>IP</td><td>{detail.ip || "—"}</td></tr>
                  <tr><td>Устройство</td><td style={{ fontSize: 12, color: "var(--muted)" }}>{detail.user_agent || "—"}</td></tr>
                </tbody>
              </table>
              {detail.diff && Object.keys(detail.diff).length > 0 && (
                <>
                  <div style={{ fontWeight: 700, margin: "16px 0 8px" }}>Изменения</div>
                  <table className="diff-table">
                    <thead><tr><th>Поле</th><th>Было</th><th>Стало</th></tr></thead>
                    <tbody>
                      {Object.entries(detail.diff).map(([field, val]: [string, any]) => (
                        <tr key={field}>
                          <td>{fieldLabel(field)}</td>
                          <td className="was"><ValueCell field={field} v={val.old} /></td>
                          <td className="now"><ValueCell field={field} v={val.new} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
            <div className="modal-foot"><button className="btn btn-primary" onClick={() => setDetail(null)}>Закрыть</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
