"use client";

import { useState } from "react";
import {
  createUser,
  updateUser,
  ApiError,
  type Role,
  type User,
  type UserPayload,
} from "../lib/api";

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "superadmin", label: "Суперадмин", hint: "Полный доступ, включая управление пользователями" },
  { value: "admin", label: "Администратор", hint: "Управление всем контентом доступных сайтов" },
  { value: "editor", label: "Редактор", hint: "Редактирование контента доступных сайтов" },
];

const SITES: { key: string; label: string }[] = [
  { key: "s1", label: "Сайт 1 — mmashvarat.tj" },
  { key: "s2", label: "Сайт 2 — a-khorijakor.tj" },
];

export default function UserForm({
  editing,
  onClose,
  onSaved,
}: {
  editing: User | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [email, setEmail] = useState(editing?.email ?? "");
  const [fullName, setFullName] = useState(editing?.full_name ?? "");
  const [role, setRole] = useState<Role>(editing?.role ?? "editor");
  const [sites, setSites] = useState<string[]>(editing?.site_access ?? []);
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(editing?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isEdit = !!editing;

  function toggleSite(key: string) {
    setSites((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isEdit && password.length < 6) {
      setError("Пароль должен быть не короче 6 символов.");
      return;
    }
    if (password && password.length < 6) {
      setError("Новый пароль должен быть не короче 6 символов.");
      return;
    }
    // доступ к сайтам определяется ролью (окончательно проверяется на сервере):
    // admin/editor должны иметь хотя бы один сайт; суперадмин — доступ ко всем.
    if (role !== "superadmin" && sites.length === 0) {
      setError("Выберите хотя бы один сайт для доступа.");
      return;
    }

    setBusy(true);
    try {
      const payload: UserPayload = {
        email: email.trim(),
        full_name: fullName.trim(),
        role,
        site_access: sites,
        is_active: isActive,
      };
      if (password) payload.password = password;

      if (isEdit) {
        await updateUser(editing!.id, payload);
      } else {
        await createUser(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить");
      setBusy(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>{isEdit ? "Редактирование пользователя" : "Новый пользователь"}</h2>
          <div className="spacer" />
          <button type="button" className="close-x" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-err">{error}</div>}

          <label className="field">
            <span>Электронная почта *</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Фамилия Имя Отчество</span>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>

          <label className="field">
            <span>Роль</span>
            <select className="select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <div className="hint">{ROLES.find((r) => r.value === role)?.hint}</div>
          </label>

          {role === "superadmin" ? (
            <div className="field">
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#33465e", marginBottom: 5 }}>
                Доступ к сайтам
              </span>
              <div className="hint" style={{ marginTop: 0 }}>
                Суперадминистратор имеет полный доступ ко всем сайтам — выбор не требуется.
              </div>
            </div>
          ) : (
            <div className="field">
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#33465e", marginBottom: 5 }}>
                Доступ к сайтам *
              </span>
              {SITES.map((s) => (
                <label key={s.key} className="check">
                  <input type="checkbox" checked={sites.includes(s.key)} onChange={() => toggleSite(s.key)} />
                  {s.label}
                </label>
              ))}
              {sites.length === 0 && (
                <div className="hint">Отметьте хотя бы один сайт — иначе пользователь не сможет редактировать контент.</div>
              )}
            </div>
          )}

          <label className="field">
            <span>{isEdit ? "Новый пароль" : "Пароль *"}</span>
            <input
              className="input"
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "Оставьте пустым, чтобы не менять" : ""}
            />
            <div className="hint">Минимум 6 символов.</div>
          </label>

          <label className="check">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Учётная запись активна
          </label>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Сохранение…" : isEdit ? "Сохранить" : "Создать"}
          </button>
        </div>
      </form>
    </div>
  );
}
