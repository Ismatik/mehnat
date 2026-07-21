"use client";

// Админка контента сайта (SPA, статический экспорт).
// Логин → оболочка с боковым меню разделов. Каждый раздел — ресурс, настройки
// или заявки. Всё редактируемое содержимое сайта правится отсюда.

import { useEffect, useMemo, useState } from "react";
import { me, clearToken, getToken, SITE_KEY, type SessionUser } from "../lib/api";
import { BRAND } from "../lib/brand";
import { RESOURCES } from "../lib/schema";
import Login from "../components/Login";
import ResourceSection from "../components/ResourceSection";
import SettingsSection from "../components/SettingsSection";
import MessagesSection from "../components/MessagesSection";

const SITE_LABEL: Record<string, string> = {
  s1: "mmashvarat.tj",
  s2: "a-khorijakor.tj",
};

export default function Page() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    if (!getToken()) {
      setBooting(false);
      return;
    }
    me()
      .then((u) => {
        if (u.role === "superadmin" || u.site_access.includes(SITE_KEY)) setSession(u);
        else clearToken();
      })
      .catch(() => clearToken())
      .finally(() => setBooting(false));
  }, []);

  function logout() {
    clearToken();
    setSession(null);
  }

  if (booting) return <div className="spinner-note">Загрузка…</div>;
  if (!session) return <Login onSuccess={setSession} />;
  return <Shell session={session} onLogout={logout} />;
}

type SectionId = string; // resource key | "__settings__" | "__messages__"

function Shell({ session, onLogout }: { session: SessionUser; onLogout: () => void }) {
  const [active, setActive] = useState<SectionId>(RESOURCES[0].key);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeDef = useMemo(() => RESOURCES.find((r) => r.key === active) || null, [active]);

  function pick(id: SectionId) {
    setActive(id);
    setMenuOpen(false);
  }

  return (
    <div className="admin-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="side-brand">
          <div className="side-mark" style={{ background: BRAND.color, color: "#fff" }}>{BRAND.letter}</div>
          <div>
            <div className="side-title">Контент сайта</div>
            <div className="side-sub">{SITE_LABEL[SITE_KEY] || SITE_KEY}</div>
          </div>
        </div>
        <nav className="side-nav">
          {RESOURCES.map((r) => (
            <button key={r.key} className={`side-link ${active === r.key ? "active" : ""}`} onClick={() => pick(r.key)}>
              <span className="side-icon">{r.icon}</span> {r.label}
            </button>
          ))}
          <div className="side-sep" />
          <button className={`side-link ${active === "__settings__" ? "active" : ""}`} onClick={() => pick("__settings__")}>
            <span className="side-icon">⚙️</span> Настройки
          </button>
          <button className={`side-link ${active === "__messages__" ? "active" : ""}`} onClick={() => pick("__messages__")}>
            <span className="side-icon">✉️</span> Заявки
          </button>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Меню">☰</button>
          <div className="spacer" />
          <span className="who">{session.email}{session.role === "superadmin" ? " · суперадмин" : ""}</span>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Выйти</button>
        </header>

        <main className="admin-content">
          {active === "__settings__" ? (
            <SettingsSection onAuthError={onLogout} />
          ) : active === "__messages__" ? (
            <MessagesSection onAuthError={onLogout} />
          ) : activeDef ? (
            <ResourceSection key={activeDef.key} def={activeDef} onAuthError={onLogout} />
          ) : null}
        </main>
      </div>

      {menuOpen && <div className="side-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
