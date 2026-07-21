"use client";

import { useState } from "react";
import { login, ApiError, type SessionUser } from "../lib/api";

export default function Login({ onSuccess }: { onSuccess: (u: SessionUser) => void }) {
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
        setError("Доступ к этой панели разрешён только суперадминистратору.");
        setBusy(false);
        return;
      }
      onSuccess(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти");
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="logo-line">
          <div className="mark" style={{ background: "#0b3b6b" }}>П</div>
          <h1>Управление пользователями</h1>
          <div className="sub">Общая административная панель · МЕХНАТ</div>
        </div>
        <div className="card card-pad">
          {error && <div className="alert alert-err">{error}</div>}
          <form onSubmit={submit}>
            <label className="field">
              <span>Электронная почта</span>
              <input
                className="input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Пароль</span>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
              {busy ? "Вход…" : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
