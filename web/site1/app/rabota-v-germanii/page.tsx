"use client";

// /rabota-v-germanii — секции facts/help/professions/steps/documents + форма.
// Структурные блоки берутся из pages(rabota-v-germanii).body.

import { useEffect, useState } from "react";
import { Shell, Hero } from "../../components/chrome";
import FeedbackSplit from "../../components/FeedbackSplit";
import { useLang } from "../../components/providers";
import { getBySlug, type Row } from "../../lib/api";
import { pick } from "../../lib/i18n";

export default function Page() {
  const { lang } = useLang();
  const [page, setPage] = useState<Row | null>(null);

  useEffect(() => {
    getBySlug("pages", "rabota-v-germanii").then(setPage).catch(() => setPage(null));
  }, []);

  const body = (page?.body && typeof page.body === "object" ? page.body : {}) as Row;
  const facts: Row[] = Array.isArray(body.facts) ? body.facts : [];
  const help: any[] = Array.isArray(body.help) ? body.help : [];
  const professions: any[] = Array.isArray(body.professions) ? body.professions : [];
  const steps: Row[] = Array.isArray(body.steps) ? body.steps : [];
  const documents: any[] = Array.isArray(body.documents) ? body.documents : [];

  const home = { ru: "Асосӣ", tg: "Асосӣ", en: "Home" }[lang];
  const dest = { ru: "Страна назначения", tg: "Кишвари таъинот", en: "Destination" }[lang];
  const heroTitle = pick(page?.hero_title, lang) || { ru: "Работа в Германии", tg: "Кор дар Олмон", en: "Work in Germany" }[lang];
  const L = {
    helpTitle: { ru: "Чем поможет Центр", tg: "Марказ чӣ гуна кӯмак мекунад", en: "How the Center helps" }[lang],
    profTitle: { ru: "Востребованные профессии", tg: "Касбҳои талабот", en: "In-demand professions" }[lang],
    stepsTitle: { ru: "Порядок оформления", tg: "Тартиби расмиёт", en: "Application procedure" }[lang],
    docsTitle: { ru: "Необходимые документы", tg: "Ҳуҷҷатҳои зарурӣ", en: "Required documents" }[lang],
    langTitle: { ru: "Знание языка", tg: "Донистани забон", en: "Language" }[lang],
  };

  return (
    <Shell activeUrl="/uslugi" footer="row">
      <Hero
        title={heroTitle}
        titleColor={pick(page?.hero_title_color, lang) || (typeof page?.hero_title_color === "string" ? page.hero_title_color : "#e8912a")}
        crumbs={[{ label: home, href: "/" }, { label: dest, href: "/uslugi" }, { label: heroTitle }]}
      />

      {/* feature image + intro */}
      <div className="wrap" style={{ padding: "48px 40px 0" }}>
        <div style={{ borderRadius: 20, overflow: "hidden", minHeight: 420, background: pick(page?.hero_image_url, lang) ? `#dbe5f1 url(${page?.hero_image_url}) center/cover` : "repeating-linear-gradient(135deg,#dbe5f1 0 16px,#eef3f9 16px 32px)", boxShadow: "0 12px 34px rgba(11,59,107,.12)" }} />
        <div style={{ padding: "34px 4px 0" }}>
          <h2 style={{ fontFamily: "'PT Serif',serif", fontSize: 34, fontWeight: 700, color: "#4a5b72", margin: "0 0 14px" }}>{heroTitle}</h2>
          <p style={{ fontSize: 16, color: "#5a6b80", lineHeight: 1.7, margin: 0, maxWidth: 900 }}>{pick(body.intro, lang)}</p>
        </div>
      </div>

      {/* facts */}
      <div className="wrap" style={{ padding: "34px 40px 0" }}>
        <div className="facts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {facts.map((f, i) => (
            <div key={i} style={{ border: "1px solid #e6ecf3", borderRadius: 12, padding: "22px 20px", background: "#fff" }}>
              <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".05em", color: "#8798ad", fontWeight: 700 }}>{pick(f.label, lang)}</div>
              <div style={{ fontFamily: "'PT Serif',serif", fontSize: 22, fontWeight: 700, color: "#0b3b6b", margin: "8px 0 6px" }}>{pick(f.value, lang)}</div>
              <div style={{ fontSize: 12.5, color: "#5a6b80", lineHeight: 1.45 }}>{pick(f.note, lang)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* help + professions */}
      <div className="wrap" style={{ padding: "44px 40px 0" }}>
        <div className="help-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 44, alignItems: "start" }}>
          <div>
            <div style={{ fontFamily: "'PT Serif',serif", fontSize: 22, fontWeight: 700, color: "#0b3b6b", marginBottom: 18 }}>{L.helpTitle}</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {help.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "13px 0", borderBottom: "1px dashed #dfe6ef" }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#1c63d6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flex: "none", marginTop: 1 }}>✓</span>
                  <div style={{ fontSize: 14.5, color: "#3a4c64", lineHeight: 1.55 }}>{pick(h, lang)}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'PT Serif',serif", fontSize: 22, fontWeight: 700, color: "#0b3b6b", marginBottom: 18 }}>{L.profTitle}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {professions.map((p, i) => (
                <span key={i} style={{ background: "#eef3f9", border: "1px solid #dbe5f1", color: "#23364f", fontSize: 14, fontWeight: 700, padding: "9px 16px", borderRadius: 22 }}>{pick(p, lang)}</span>
              ))}
            </div>
            <div style={{ marginTop: 22, background: "#f4f7fb", border: "1px solid #e6ecf3", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1b2c44", marginBottom: 6 }}>{L.langTitle}</div>
              <div style={{ fontSize: 14, color: "#5a6b80", lineHeight: 1.6 }}>{pick(body.language_note, lang)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* steps */}
      <div className="wrap" style={{ padding: "48px 40px 0" }}>
        <div style={{ fontFamily: "'PT Serif',serif", fontSize: 22, fontWeight: 700, color: "#0b3b6b", marginBottom: 24 }}>{L.stepsTitle}</div>
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ border: "1px solid #e6ecf3", borderRadius: 12, padding: "22px 18px", background: "#fff" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0b3b6b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'PT Serif',serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>{typeof s.n === "string" ? s.n : String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1b2c44", marginBottom: 6 }}>{pick(s.title, lang)}</div>
              <div style={{ fontSize: 13, color: "#5a6b80", lineHeight: 1.5 }}>{pick(s.desc, lang)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* documents + warning */}
      <div className="wrap" style={{ padding: "48px 40px 0" }}>
        <div className="docs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ border: "1px solid #e6ecf3", borderRadius: 14, padding: "28px 30px", background: "#fff" }}>
            <div style={{ fontFamily: "'PT Serif',serif", fontSize: 20, fontWeight: 700, color: "#0b3b6b", marginBottom: 16 }}>{L.docsTitle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {documents.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1c63d6", flex: "none", marginTop: 7 }} />
                  <div style={{ fontSize: 14.5, color: "#3a4c64", lineHeight: 1.5 }}>{pick(d, lang)}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fdf4e7", border: "1px solid #eecb92", borderLeft: "5px solid #d68a1e", borderRadius: 14, padding: "28px 30px" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#d68a1e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flex: "none" }}>⚠</div>
              <div>
                <div style={{ fontFamily: "'PT Serif',serif", fontSize: 19, fontWeight: 700, color: "#8a5a12", marginBottom: 8 }}>{pick(body.warning_title, lang)}</div>
                <div style={{ fontSize: 14, color: "#6b5228", lineHeight: 1.6 }}>{pick(body.warning_text, lang)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FeedbackSplit sourcePage="rabota-v-germanii" />
    </Shell>
  );
}
