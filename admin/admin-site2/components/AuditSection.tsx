"use client";

// Раздел «Логи» админки контента: логи ТОЛЬКО своего сайта. Каждая строка —
// человекочитаемая фраза; клик → детали (diff-таблица + техданные). Только чтение.

import { useCallback, useEffect, useMemo, useState } from "react";
import { listAudit, ApiError, type Row } from "../lib/api";
import { RESOURCES } from "../lib/schema";
import { phrase, fieldLabel, fmtValue, isHex, ACTION_WORD } from "../lib/auditdict";

function fmtTs(ts: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? ts : d.toLocaleString("ru-RU");
}

// Значение с образцом цвета для hex.
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

export default function AuditSection({ onAuthError }: { onAuthError: () => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);
  const [f, setF] = useState({ actor: "", action: "", resource: "", ip: "", from: "", to: "" });

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
  const hasFilters = f.actor || f.action || f.resource || f.ip || f.from || f.to;

  return (
    <div>
      <div className="section-head">
        <div><h1>📋 Логи</h1><div className="muted">Действия с контентом этого сайта · {rows.length}</div></div>
        <div className="spacer" />
        <button className="btn btn-ghost btn-sm" onClick={exportCSV} disabled={!rows.length}>Экспорт CSV</button>
        <button className="btn btn-ghost btn-sm" onClick={exportXLSX} disabled={!rows.length}>Экспорт Excel</button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="field-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <div><label className="field-label">Пользователь</label><input className="input" value={f.actor} onChange={(e) => set("actor", e.target.value)} placeholder="почта…" /></div>
          <div><label className="field-label">Действие</label>
            <select className="select" value={f.action} onChange={(e) => set("action", e.target.value)}>
              <option value="">все</option>
              {["create", "update", "delete", "publish", "unpublish", "upload"].map((k) => <option key={k} value={k}>{ACTION_WORD[k]}</option>)}
            </select>
          </div>
          <div><label className="field-label">Раздел</label>
            <select className="select" value={f.resource} onChange={(e) => set("resource", e.target.value)}>
              <option value="">все</option>
              <option value="settings">Настройки</option>
              {RESOURCES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          <div><label className="field-label">IP</label><input className="input" value={f.ip} onChange={(e) => set("ip", e.target.value)} /></div>
          <div><label className="field-label">С даты</label><input className="input" type="datetime-local" value={f.from} onChange={(e) => set("from", e.target.value)} /></div>
          <div><label className="field-label">По дату</label><input className="input" type="datetime-local" value={f.to} onChange={(e) => set("to", e.target.value)} /></div>
        </div>
        {hasFilters && <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setF({ actor: "", action: "", resource: "", ip: "", from: "", to: "" })}>Сбросить фильтры</button>}
      </div>

      {error && <div className="alert alert-err">{error}</div>}

      <div className="card">
        {loading ? <div className="center-note">Загрузка…</div> : rows.length === 0 ? <div className="center-note">Записей нет.</div> : (
          <table className="audit-table">
            <thead><tr><th>Действие</th><th>Дата-время</th><th>IP</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="clk" onClick={() => setDetail(r)} title="Подробнее">
                  <td><span className={`act-dot act-${r.action}`} /> {phrase(r)}</td>
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
