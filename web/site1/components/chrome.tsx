"use client";

// Повторяющиеся блоки макета: UtilityBar, Header/masthead, Hero-баннер, Footer,
// и оболочка Shell (UtilityBar + Header + контент + Footer). Наполнение — из
// settings/menu через провайдеры. Разметка/цвета — 1:1 из design/mockup/*.html.

import { useState } from "react";
import { useLang, useSiteData } from "./providers";
import { LANGS, pick, type Lang } from "../lib/i18n";
import { socialLinks } from "../lib/socials.js";
import { SITE_KEY } from "../lib/api";

// Буква логотипа-заглушки (пока не загружен logo_url): пара сайт↔админка.
const BRAND_LETTER = SITE_KEY === "s2" ? "Х" : "М";

const PRIMARY = "#0b3b6b";

// Каноничный внутренний href: при trailingSlash каждая страница = /path/ .
// Приводим внутренние ссылки к виду со слешем, чтобы навигация никогда не била
// в no-slash вариант (который отдавал бы 301). Внешние ссылки, якоря и query — как есть.
export function canonicalHref(url: string): string {
  if (!url) return "/";
  if (/^(https?:)?\/\//.test(url) || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) return url;
  const [path, rest] = url.split(/(?=[?#])/, 2) as [string, string?];
  if (path === "/" || path.endsWith("/")) return url;
  return path + "/" + (rest || "");
}

// Флаг текущего языка (RU → РФ, ТҶ → Таджикистан, EN → Великобритания).
// Отражает выбранный язык, синхронизирован с переключателем RU/ТҶ/EN.
function Flag({ lang }: { lang: Lang }) {
  const box: React.CSSProperties = { width: 26, height: 18, borderRadius: 2, overflow: "hidden", flex: "none", display: "block", border: "1px solid rgba(0,0,0,.08)" };
  if (lang === "ru") {
    return (
      <svg style={box} viewBox="0 0 30 20" preserveAspectRatio="none" aria-label="Русский">
        <rect width="30" height="20" fill="#fff" />
        <rect y="6.67" width="30" height="6.67" fill="#0039a6" />
        <rect y="13.33" width="30" height="6.67" fill="#d52b1e" />
      </svg>
    );
  }
  if (lang === "tg") {
    return (
      <svg style={box} viewBox="0 0 30 20" preserveAspectRatio="none" aria-label="Тоҷикӣ">
        <rect width="30" height="20" fill="#fff" />
        <rect width="30" height="6" fill="#cc0000" />
        <rect y="14" width="30" height="6" fill="#006600" />
        <rect x="13" y="8.5" width="4" height="1.4" fill="#f8c300" />
        <rect x="13.4" y="7.4" width="3.2" height="1" fill="#f8c300" />
      </svg>
    );
  }
  // EN → Union Jack (упрощённый, узнаваемый)
  return (
    <svg style={box} viewBox="0 0 60 30" preserveAspectRatio="none" aria-label="English">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
      <rect x="25" width="10" height="30" fill="#fff" />
      <rect y="10" width="60" height="10" fill="#fff" />
      <rect x="27" width="6" height="30" fill="#C8102E" />
      <rect y="12" width="60" height="6" fill="#C8102E" />
    </svg>
  );
}

// ---- Переключатель языка (в utility bar) ----
function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <span style={{ display: "flex", gap: 9, alignItems: "center" }}>
      {LANGS.map((l) =>
        l.code === lang ? (
          <strong key={l.code} style={{ color: "#fff" }}>{l.short}</strong>
        ) : (
          <span key={l.code} style={{ opacity: 0.55, cursor: "pointer" }} onClick={() => setLang(l.code)}>
            {l.short}
          </span>
        )
      )}
    </span>
  );
}

// ---- Иконки соцсетей (настоящие логотипы, белые, центрируются сами) ----
type SocialKind = "facebook" | "instagram" | "youtube" | "telegram";
function SocialIcon({ kind, size = 20 }: { kind: SocialKind; size?: number }) {
  const st: React.CSSProperties = { width: size, height: size, display: "block" };
  switch (kind) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" style={st} fill="#fff" aria-hidden>
          <path d="M15.12 8.5H16.5V6.03c-.3-.04-1.16-.13-2.16-.13-2.14 0-3.6 1.3-3.6 3.7V11.5H8.4V14h2.34v6.5h2.86V14h2.35l.36-2.5h-2.71V9.66c0-.72.2-1.16 1.26-1.16z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" style={st} fill="none" stroke="#fff" strokeWidth={1.8} aria-hidden>
          <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5" />
          <circle cx="12" cy="12" r="3.8" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="#fff" stroke="none" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" style={st} fill="#fff" aria-hidden>
          <path d="M21.6 7.9c-.23-.86-.9-1.53-1.76-1.76C18.26 5.7 12 5.7 12 5.7s-6.26 0-7.84.44c-.86.23-1.53.9-1.76 1.76C1.96 9.5 1.96 12 1.96 12s0 2.5.44 4.1c.23.86.9 1.53 1.76 1.76 1.58.44 7.84.44 7.84.44s6.26 0 7.84-.44c.86-.23 1.53-.9 1.76-1.76.44-1.6.44-4.1.44-4.1s0-2.5-.44-4.1zM10 15V9l5.2 3-5.2 3z" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" style={st} fill="#fff" aria-hidden>
          <path d="M21.9 4.3 3.5 11.4c-.9.36-.88.86-.14 1.09l4.7 1.46 1.8 5.7c.2.55.36.76.75.76.38 0 .55-.17.76-.42l2.26-2.2 4.7 3.47c.86.48 1.48.23 1.7-.8l3.05-14.4c.32-1.26-.47-1.83-1.64-1.36z" />
        </svg>
      );
  }
}

// ---- Utility bar ----
export function UtilityBar() {
  const { lang } = useLang();
  const { settings } = useSiteData();
  const org = pick(settings.org_status, lang) || "Государственное учреждение · Республика Таджикистан";
  const socials = socialLinks(settings);
  return (
    <div style={{ background: "#08305a", color: "#cfe0f2", fontSize: 13 }}>
      <div className="wrap" style={{ padding: "8px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7ec48a" }} />
          {org}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {socials.length > 0 && (
            <span data-socials="utility" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {socials.map((s) => (
                <a key={s.kind} data-social={s.kind} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label} style={{ width: 20, height: 20, borderRadius: 4, background: s.brand, display: "flex", alignItems: "center", justifyContent: "center", color: "inherit" }}>
                  <SocialIcon kind={s.kind as SocialKind} size={13} />
                </a>
              ))}
            </span>
          )}
          <LangSwitcher />
        </span>
      </div>
    </div>
  );
}

// ---- Header / masthead ----
export function Header({ activeUrl }: { activeUrl?: string }) {
  const { lang, setLang } = useLang();
  const { settings, menu } = useSiteData();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const title = pick(settings.site_title, lang) || "Центры консультирования и подготовки трудовых мигрантов перед выездом";
  const subtitle = pick(settings.site_subtitle, lang) || "Государственное учреждение";
  const logo = typeof settings.logo_url === "string" ? settings.logo_url : "";
  const roots = (menu || []).filter((m) => !m.parent_id);

  return (
    <div style={{ background: "#fff", borderBottom: `3px solid ${PRIMARY}` }}>
      <div className="wrap mast" style={{ padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
          {logo ? (
            <img src={logo} alt="Логотип" style={{ width: 58, height: 58, objectFit: "contain", flex: "none", display: "block" }} />
          ) : (
            <span style={{ width: 58, height: 58, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'PT Serif',serif", fontWeight: 700, fontSize: 24, flex: "none" }}>{BRAND_LETTER}</span>
          )}
          <div style={{ maxWidth: 520 }}>
            <div style={{ fontFamily: "'PT Serif',serif", fontWeight: 700, fontSize: 15.5, color: PRIMARY, lineHeight: 1.25 }}>{title}</div>
            <div style={{ fontSize: 11.5, color: "#7286a0", letterSpacing: ".03em", marginTop: 2 }}>{subtitle}</div>
          </div>
        </a>
        <button className="burger" aria-label="Меню" onClick={() => setOpen((o) => !o)}>☰</button>
        <div className={`nav${open ? " open" : ""}`} style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14, fontWeight: 700, color: "#23364f", flex: "none" }}>
          {roots.map((m) => {
            const label = pick(m.label, lang);
            const isActive = activeUrl && m.url === activeUrl;
            const children = (menu || []).filter((c) => c.parent_id === m.id);
            return (
              <a key={m.id} href={canonicalHref(m.url || "/")} style={{ display: "flex", alignItems: "center", gap: 4, color: isActive ? PRIMARY : undefined }}>
                {label}
                {children.length > 0 && <span style={{ fontSize: 10, color: "#9aa9bd" }}>▾</span>}
              </a>
            );
          })}
          <span style={{ position: "relative" }}>
            <span
              className="clk"
              onClick={() => setLangOpen((o) => !o)}
              title="Выбрать язык"
              style={{ display: "flex", alignItems: "center", gap: 7, paddingLeft: 6 }}
            >
              <Flag lang={lang} />
              <span style={{ fontSize: 10, color: "#9aa9bd" }}>▾</span>
            </span>
            {langOpen && (
              <div
                onMouseLeave={() => setLangOpen(false)}
                style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, background: "#fff", border: "1px solid #e6ecf3", borderRadius: 8, boxShadow: "0 10px 26px rgba(11,59,107,.14)", padding: 6, zIndex: 40, minWidth: 160 }}
              >
                {LANGS.map((l) => (
                  <div
                    key={l.code}
                    className="clk"
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, background: l.code === lang ? "#eef3f9" : "transparent", fontWeight: 700, fontSize: 13, color: "#23364f" }}
                  >
                    <Flag lang={l.code} /> {l.label}
                  </div>
                ))}
              </div>
            )}
          </span>
          <a href="/#reg" className="cab clk" style={{ background: PRIMARY, color: "#fff", padding: "10px 18px", borderRadius: 4, fontSize: 13.5 }}>
            {{ ru: "Зарегистрируйтесь в Центре", tg: "Дар Марказ бақайд шавед", en: "Register at the Center" }[lang]}
          </a>
        </div>
      </div>
    </div>
  );
}

// ---- Hero-баннер (внутренние страницы) ----
export function Hero({
  title,
  subtitle,
  crumbs,
  titleColor,
  image,
}: {
  title: string;
  subtitle?: string;
  crumbs: { label: string; href?: string }[];
  titleColor?: string;
  image?: string;
}) {
  return (
    <div
      className="hero-banner"
      style={{
        position: "relative",
        minHeight: 420,
        background: image ? `#0b3b6b url(${image}) center/cover` : "#0b3b6b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {!image && <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(135deg,rgba(255,255,255,.06) 0 18px,rgba(255,255,255,.02) 18px 36px)" }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(8,32,58,.45) 0%,rgba(8,32,58,.7) 100%)" }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff", maxWidth: 820, padding: "0 40px" }}>
        <h1 style={{ fontFamily: "'PT Serif',serif", fontSize: 46, fontWeight: 700, letterSpacing: ".02em", margin: "0 0 18px", color: titleColor || "#fff" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 16, color: "#e2edf8", lineHeight: 1.6, margin: "0 0 22px" }}>{subtitle}</p>}
        <div className="crumbs" style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.28)", padding: "10px 22px", borderRadius: 30, fontSize: 14, fontWeight: 700 }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              {i > 0 && <span style={{ color: "#7ea6d6" }}>»</span>}
              {c.href ? <a href={c.href} style={{ color: "#cfe0f2" }}>{c.label}</a> : <span style={{ color: "#fff" }}>{c.label}</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Footer: компактная строка (внутренние страницы) ----
function FooterRow() {
  const { lang } = useLang();
  const { settings } = useSiteData();
  const phone1 = settings.phone_1 || "225-05-75";
  const phone2 = settings.phone_2 || "225-02-21";
  const copyright = pick(settings.footer_copyright, lang) || "Ҳуқуқҳо ҳимоя шудаанд © All rights reserved 2026";
  const socials = socialLinks(settings);
  return (
    <div style={{ background: PRIMARY, color: "#fff", marginTop: 52 }}>
      <div className="wrap foot-row" style={{ padding: "36px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30, flexWrap: "wrap" }}>
        <a href="/kontakty/" className="clk" style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: ".03em", padding: "13px 32px", borderRadius: 30 }}>{{ ru: "Контакты", tg: "Тамос", en: "Contacts" }[lang]}</a>
        {socials.length > 0 && (
          <div data-socials="footer" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {socials.map((s) => (
              <a key={s.kind} data-social={s.kind} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label} className="clk" style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SocialIcon kind={s.kind as SocialKind} size={20} />
              </a>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flex: "none" }}>☎</span>
          <div>
            <div style={{ fontSize: 12.5, color: "#9fc0e4" }}>{{ ru: "Телефоны для связи", tg: "Телефонҳо барои тамос", en: "Contact phones" }[lang]}</div>
            <div style={{ fontFamily: "'PT Serif',serif", fontSize: 19, fontWeight: 700 }}>{phone1} | {phone2}</div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,.12)" }}>
        <div className="wrap" style={{ padding: "16px 40px", textAlign: "center", color: "#9fc0e4", fontSize: 12.5 }}>{copyright}</div>
      </div>
    </div>
  );
}

// ---- Footer: полный 4-колоночный (главная) ----
function FooterFull() {
  const { lang } = useLang();
  const { settings, menu } = useSiteData();
  const title = pick(settings.site_title, lang) || "Центры консультирования и подготовки трудовых мигрантов";
  const phone1 = settings.phone_1 || "225-05-75";
  const phone2 = settings.phone_2 || "225-02-21";
  const copyright = pick(settings.copyright, lang) || "© 2026 Государственное учреждение «Центры консультирования и подготовки трудовых мигрантов перед выездом»";
  const logo = typeof settings.logo_url === "string" ? settings.logo_url : "";
  const roots = (menu || []).filter((m) => !m.parent_id).slice(0, 5);

  return (
    <div style={{ background: "#08305a", color: "#aac4de", fontSize: 13.5 }}>
      <div className="wrap foot-grid" style={{ padding: "32px 40px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 30 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", marginBottom: 12 }}>
            {logo ? (
              <img src={logo} alt="" style={{ width: 42, height: 42, objectFit: "contain", flex: "none", display: "block", background: "#fff", borderRadius: "50%", padding: 2 }} />
            ) : (
              <span style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'PT Serif',serif", fontWeight: 700 }}>{BRAND_LETTER}</span>
            )}
            <strong style={{ fontSize: 13.5, lineHeight: 1.3 }}>{title}</strong>
          </div>
          <div style={{ lineHeight: 1.6, color: "#90adcb" }}>
            {pick(settings.site_subtitle, lang) || "Государственное учреждение"}<br />
            {pick(settings.address, lang) || "Республика Таджикистан, г. Душанбе"}
          </div>
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, marginBottom: 10 }}>{{ ru: "Разделы", tg: "Бахшҳо", en: "Sections" }[lang]}</div>
          <div style={{ lineHeight: 2, color: "#90adcb" }}>
            {roots.map((m) => (
              <div key={m.id}><a href={canonicalHref(m.url || "/")}>{pick(m.label, lang)}</a></div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, marginBottom: 10 }}>{{ ru: "Гражданам", tg: "Ба шаҳрвандон", en: "For citizens" }[lang]}</div>
          <div style={{ lineHeight: 2, color: "#90adcb" }}>
            <div><a href="/novosti/">{{ ru: "Новости", tg: "Хабарҳо", en: "News" }[lang]}</a></div>
            <div><a href="/#reg">{{ ru: "Регистрация", tg: "Бақайдгирӣ", en: "Registration" }[lang]}</a></div>
            <div><a href="/kontakty/">{{ ru: "Контакты", tg: "Тамос", en: "Contacts" }[lang]}</a></div>
          </div>
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, marginBottom: 10 }}>{{ ru: "Контакты", tg: "Тамос", en: "Contacts" }[lang]}</div>
          <div style={{ lineHeight: 2, color: "#90adcb" }}>
            {phone1} · {phone2}<br />
            {typeof settings.telegram_handle === "string" ? settings.telegram_handle : "Telegram"}<br />
            Facebook
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,.1)" }}>
        <div className="wrap" style={{ padding: "14px 40px", color: "#7d9bbb", fontSize: 12.5 }}>{copyright}</div>
      </div>
    </div>
  );
}

// ---- Оболочка страницы ----
export function Shell({
  activeUrl,
  footer = "row",
  children,
}: {
  activeUrl?: string;
  footer?: "row" | "full";
  children: React.ReactNode;
}) {
  return (
    <>
      <UtilityBar />
      <Header activeUrl={activeUrl} />
      {children}
      {footer === "full" ? <FooterFull /> : <FooterRow />}
    </>
  );
}
