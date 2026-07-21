"use client";

// Настройки сайта: key/value, сгруппированы. Каждое значение сохраняется
// отдельным PUT /settings/{key}. Меняет логотип, фото Президента, ATS, QR,
// телефоны, соцсети, warning-блок, тексты блоков и т.д.

import { useCallback, useEffect, useState } from "react";
import { getSettings, putSetting, ApiError } from "../lib/api";
import { SETTINGS_GROUPS, type SettingField, type Field } from "../lib/schema";
import { FieldEditor, LangProvider, LangTabs, type FieldCtx } from "./Fields";

const asField = (f: SettingField): Field => ({ name: f.key, label: f.label, type: f.type, hint: f.hint, aspect: f.aspect });

export default function SettingsSection({ onAuthError }: { onAuthError: () => void }) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const ctx: FieldCtx = {};

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setValues(await getSettings());
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

  const set = (key: string, v: any) => setValues((s) => ({ ...s, [key]: v }));

  async function saveOne(key: string) {
    try {
      await putSetting(key, values[key] ?? null);
      setSavedKey(key);
      setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 1500);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Ошибка сохранения");
    }
  }

  async function saveAll() {
    setSavingAll(true);
    try {
      const keys = SETTINGS_GROUPS.flatMap((g) => g.fields.map((f) => f.key));
      await Promise.all(keys.map((k) => putSetting(k, values[k] ?? null)));
      setSavedKey("__all__");
      setTimeout(() => setSavedKey((k) => (k === "__all__" ? null : k)), 1800);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return onAuthError();
      alert(e instanceof ApiError ? e.message : "Ошибка сохранения");
    } finally {
      setSavingAll(false);
    }
  }

  if (loading) return <div className="center-note">Загрузка настроек…</div>;

  return (
    <LangProvider>
      <div className="section-head">
        <div>
          <h1>⚙️ Настройки сайта</h1>
          <div className="muted">Логотип, контакты, соцсети, QR, тексты общих блоков</div>
        </div>
        <div className="spacer" />
        <span className="muted" style={{ fontSize: 13 }}>Язык:</span>
        <LangTabs />
        <button className="btn btn-primary" onClick={saveAll} disabled={savingAll}>
          {savingAll ? "Сохранение…" : savedKey === "__all__" ? "Сохранено ✓" : "Сохранить всё"}
        </button>
      </div>

      {error && <div className="alert alert-err">{error}</div>}

      <div className="stack" style={{ gap: 18 }}>
        {SETTINGS_GROUPS.map((g) => (
          <div key={g.title} className="card card-pad">
            <h2 className="group-title">{g.icon} {g.title}</h2>
            <div className="field-grid">
              {g.fields.map((sf) => (
                <div key={sf.key} className={sf.type === "i18n-text" || sf.type === "image" ? "col-full" : ""}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <label className="field-label">{sf.label}</label>
                    <button className="mini-save" onClick={() => saveOne(sf.key)}>
                      {savedKey === sf.key ? "✓" : "сохранить"}
                    </button>
                  </div>
                  <FieldEditor field={asField(sf)} value={values[sf.key]} onChange={(v) => set(sf.key, v)} ctx={ctx} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </LangProvider>
  );
}
