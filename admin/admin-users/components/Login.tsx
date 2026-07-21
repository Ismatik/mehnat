"use client";

import { useState } from "react";
import { login, type SessionUser } from "../lib/api";
import { useUiLang, useT } from "./uilang";
import { UI_LANGS } from "../lib/messages";

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
      if (user.role !== "superadmin") {
        setError(t("superadmin_only_full"));
        setBusy(false);
        return;
      }
      onSuccess(user);
    } catch (err) {
      setError(et(err));
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-langs" role="group" aria-label={t("ui_language")}>
          {UI_LANGS.map((l) => (
            <button key={l.code} type="button" className={`login-lang ${lang === l.code ? "active" : ""}`} onClick={() => setLang(l.code)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="logo-line">
          <div className="mark" style={{ background: "#0b3b6b" }}>П</div>
          <h1>{t("login_title")}</h1>
          <div className="sub">{t("login_sub")}</div>
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
