"use client";

// /o-nas — коллаж фото + «Наша цель» + два списка с галочками. Из pages(o-nas).

import { useEffect, useState } from "react";
import { Shell, Hero } from "../../components/chrome";
import FeedbackSplit from "../../components/FeedbackSplit";
import { useLang } from "../../components/providers";
import { getBySlug, type Row } from "../../lib/api";
import { pick } from "../../lib/i18n";

const angles = ["-2deg", "1.5deg", "1deg", "-1.5deg"];

function CheckList({ items, lang }: { items: any[]; lang: any }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {(items || []).map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "13px 0", borderBottom: "1px dashed #dfe6ef" }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#1c63d6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flex: "none", marginTop: 1 }}>✓</span>
          <div style={{ fontSize: 14.5, color: "#3a4c64", lineHeight: 1.55 }}>{pick(it, lang)}</div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const { lang } = useLang();
  const [page, setPage] = useState<Row | null>(null);

  useEffect(() => {
    getBySlug("pages", "o-nas").then(setPage).catch(() => setPage(null));
  }, []);

  const body = (page?.body && typeof page.body === "object" ? page.body : {}) as Row;
  const collage: string[] = Array.isArray(body.collage) ? body.collage : ["", "", "", ""];
  const home = { ru: "Асосӣ", tg: "Асосӣ", en: "Home" }[lang];
  const heroTitle = pick(page?.hero_title, lang) || { ru: "О нас", tg: "Дар бораи мо", en: "About us" }[lang];

  return (
    <Shell activeUrl="/o-nas" footer="row">
      <Hero title={heroTitle} crumbs={[{ label: home, href: "/" }, { label: heroTitle }]} />

      <div className="wrap about-title" style={{ maxWidth: 1000, padding: "52px 40px 8px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'PT Serif',serif", fontSize: 30, fontWeight: 700, color: "#1b2c44", lineHeight: 1.3, margin: 0 }}>{pick(body.heading, lang)}</h2>
      </div>

      <div className="wrap" style={{ padding: "36px 40px 8px" }}>
        <div className="about-grid" style={{ display: "grid", gridTemplateColumns: ".92fr 1.08fr", gap: 48, alignItems: "start" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {collage.slice(0, 4).map((img, i) => (
                <div key={i} style={{ aspectRatio: "4 / 3", borderRadius: 10, background: img ? `#dbe5f1 url(${img}) center/cover` : "repeating-linear-gradient(135deg,#dbe5f1 0 14px,#eef3f9 14px 28px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8ba1bd", fontSize: 22, transform: `rotate(${angles[i]})`, boxShadow: "0 8px 22px rgba(11,59,107,.12)" }}>
                  {!img && "📷"}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 38 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#fdeceb", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <span style={{ fontSize: 26, color: "var(--accent)" }}>◎</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'PT Serif',serif", fontSize: 20, fontWeight: 700, color: "#0b3b6b" }}>{pick(body.goal_title, lang)}</div>
                  <div style={{ fontSize: 13, color: "#7286a0", lineHeight: 1.45, marginTop: 3, maxWidth: 340 }}>{pick(body.goal_subtitle, lang)}</div>
                </div>
              </div>
              <p style={{ fontSize: 14.5, color: "#4a5b72", lineHeight: 1.7, textAlign: "justify", margin: 0 }}>{pick(body.goal_text, lang)}</p>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: "'PT Serif',serif", fontSize: 19, fontWeight: 700, color: "#1b2c44", marginBottom: 18 }}>{pick(body.list1_title, lang)}</div>
            <CheckList items={body.list1} lang={lang} />
            <div style={{ fontFamily: "'PT Serif',serif", fontSize: 19, fontWeight: 700, color: "#1b2c44", margin: "32px 0 18px" }}>{pick(body.list2_title, lang)}</div>
            <CheckList items={body.list2} lang={lang} />
          </div>
        </div>
      </div>

      <FeedbackSplit sourcePage="o-nas" />
    </Shell>
  );
}
