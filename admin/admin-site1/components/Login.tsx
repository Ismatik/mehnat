"use client";

import { useState } from "react";
import { login, SITE_KEY, type SessionUser } from "../lib/api";
import { BRAND } from "../lib/brand";
import { useUiLang, useT } from "./uilang";
import { UI_LANGS } from "../lib/messages";

const SITE_LABEL: Record<string, string> = {
  s1: "Сайт 1 · mmashvarat.tj",
  s2: "Сайт 2 · a-khorijakor.tj",
};

export default function Login({ onSuccess }: { onSuccess: (u: SessionUser) => void }) {
  const { lang, setLang } = useUiLang();
  const { t, et } = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      const allowed = user.role === "superadmin" || user.site_access.includes(SITE_KEY);
      if (!allowed) {
        setError(t("no_access_site"));
        setBusy(false);
        return;
      }
      onSuccess(user);
    } catch (err) {
      setError(et(err)); // локализованный текст по коду ошибки API
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        {/* переключатель языка интерфейса */}
        <div className="login-langs" role="group" aria-label={t("ui_language")}>
          {UI_LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`login-lang ${lang === l.code ? "active" : ""}`}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="logo-line">
          <div className="mark" style={{ background: BRAND.color }}>{BRAND.letter}</div>
          <h1>{t("login_title")}</h1>
          <div className="sub">{SITE_LABEL[SITE_KEY] || SITE_KEY}</div>
        </div>
        <div className="card card-pad">
          {error && <div className="alert alert-err">{error}</div>}
          <form onSubmit={submit}>
            <label className="field">
              <span>{t("email")}</span>
              <input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="field">
              <span>{t("password")}</span>
              <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
              {busy ? t("signing_in") : t("sign_in")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
