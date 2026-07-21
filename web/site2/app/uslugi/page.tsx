"use client";

// /uslugi — карточки стран с флагами (highlighted/available), ссылки «Подробнее».

import { useEffect, useState } from "react";
import { Shell, Hero, canonicalHref } from "../../components/chrome";
import { useLang, useSiteData } from "../../components/providers";
import { listResource, type Row } from "../../lib/api";
import { pick } from "../../lib/i18n";

export default function Page() {
  const { lang } = useLang();
  const { ready } = useSiteData();
  const [countries, setCountries] = useState<Row[]>([]);

  useEffect(() => {
    listResource("countries").then(setCountries).catch(() => setCountries([]));
  }, []);

  const L = {
    hero: { ru: "Услуги", tg: "Хидматҳо", en: "Services" }[lang],
    heroSub: {
      ru: "Государственное учреждение «Центры консультирования и подготовки трудовых мигрантов перед выездом» помогает гражданам Республики Таджикистан трудоустроиться за рубежом.",
      tg: "Муассисаи давлатии «Марказҳои машваратӣ ва омодагии муҳоҷирони меҳнатӣ» ба шаҳрвандони Ҷумҳурии Тоҷикистон дар корёбӣ дар хориҷа кӯмак мекунад.",
      en: "The state institution helps citizens of the Republic of Tajikistan find employment abroad.",
    }[lang],
    home: { ru: "Асосӣ", tg: "Асосӣ", en: "Home" }[lang],
    self: { ru: "Услуги", tg: "Хидматҳо", en: "Services" }[lang],
    section: { ru: "Работа в зарубежных странах", tg: "Кор дар кишварҳои хориҷӣ", en: "Working abroad" }[lang],
    more: { ru: "Подробнее", tg: "Муфассал", en: "Details" }[lang],
  };

  return (
    <Shell activeUrl="/uslugi" footer="row">
      <Hero title={L.hero} subtitle={L.heroSub} crumbs={[{ label: L.home, href: "/" }, { label: L.self }]} />

      <div className="wrap" style={{ padding: "56px 40px 0", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'PT Serif',serif", fontSize: 34, fontWeight: 700, color: "#1b2c44", margin: 0 }}>{L.section}</h2>
        <div style={{ width: 80, height: 4, background: "var(--accent)", borderRadius: 3, margin: "16px auto 0" }} />
      </div>

      <div className="wrap" style={{ padding: "44px 40px 8px" }}>
        <div className="cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}>
          {countries.map((c) => {
            const hl = !!c.highlighted;
            const linkColor = hl ? "var(--accent)" : "#1c63d6";
            const detail = c.description && typeof c.description === "object" ? c.description : {};
            const text = pick(detail.tagline, lang) || pick(detail.short, lang) || pick(c.description, lang);
            const href = c.available && c.link_url ? canonicalHref(c.link_url) : undefined;
            const inner = (
              <>
                <div style={{ height: 84, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  {c.flag_url ? (
                    <img src={c.flag_url} alt="" style={{ width: 66, height: 66, borderRadius: "50%", objectFit: "cover", boxShadow: "0 8px 16px rgba(11,59,107,.28)" }} />
                  ) : (
                    <div style={{ width: 66, height: 66, borderRadius: "50%", background: "linear-gradient(135deg,#2f7be6,#1550b8)", boxShadow: "0 8px 16px rgba(11,59,107,.28)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontFamily: "'PT Serif',serif" }}>
                      {pick(c.name, lang).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: "'PT Serif',serif", fontSize: 19, fontWeight: 700, color: "#1b2c44", marginBottom: 8 }}>{pick(c.name, lang)}</div>
                <div style={{ fontSize: 14, color: hl ? "#5a6b80" : "#8798ad", lineHeight: 1.55, marginBottom: 18 }}>{text}</div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: linkColor }}>
                  {L.more} <span>→</span>
                </span>
              </>
            );
            const cardStyle: React.CSSProperties = {
              background: "#fff",
              border: `1px solid ${hl ? "#f2c9cd" : "#eef2f7"}`,
              borderRadius: 14,
              padding: "34px 28px 30px",
              textAlign: "center",
              boxShadow: hl ? "0 4px 18px rgba(213,43,30,.08)" : "0 4px 18px rgba(11,59,107,.07)",
              display: "block",
            };
            return href ? (
              <a key={c.id} className={`ccard${hl ? " hl" : ""}`} href={href} style={cardStyle}>{inner}</a>
            ) : (
              <div key={c.id} className={`ccard${hl ? " hl" : ""} clk`} style={cardStyle}>{inner}</div>
            );
          })}
        </div>
      </div>
      {!ready && null}
    </Shell>
  );
}
