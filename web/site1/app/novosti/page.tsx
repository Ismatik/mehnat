"use client";

// /novosti — сетка новостей 3-в-ряд; детальная страница по ?slug=.
// (Статический экспорт не поддерживает произвольные динамические маршруты,
//  поэтому деталь — на том же пути с параметром slug, глубокая ссылка сохраняется.)

import { useEffect, useState } from "react";
import { Shell, Hero } from "../../components/chrome";
import FeedbackSplit from "../../components/FeedbackSplit";
import { useLang } from "../../components/providers";
import { listResource, getBySlug, type Row } from "../../lib/api";
import { pick, type Lang } from "../../lib/i18n";

function fmtDate(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: iso, time: "" };
  const p = (n: number) => String(n).padStart(2, "0");
  return { date: `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`, time: `${p(d.getHours())}:${p(d.getMinutes())}` };
}

export default function Page() {
  const { lang } = useLang();
  const [slug, setSlug] = useState<string | null>(null);
  const [list, setList] = useState<Row[]>([]);
  const [item, setItem] = useState<Row | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("slug");
    setSlug(s);
  }, []);

  useEffect(() => {
    if (slug) {
      setItem(null);
      setNotFound(false);
      getBySlug("news", slug).then(setItem).catch(() => setNotFound(true));
    } else if (slug === null) {
      listResource("news").then(setList).catch(() => setList([]));
    }
  }, [slug]);

  const home = { ru: "Асосӣ", tg: "Асосӣ", en: "Home" }[lang];
  const heroTitle = { ru: "НОВОСТИ", tg: "ХАБАРҲО", en: "NEWS" }[lang];
  const badge = { ru: "Новости", tg: "Хабарҳо", en: "News" }[lang];
  const back = { ru: "← Все новости", tg: "← Ҳамаи хабарҳо", en: "← All news" }[lang];
  const nf = { ru: "Новость не найдена.", tg: "Хабар ёфт нашуд.", en: "News not found." }[lang];

  // ---- Детальная новость ----
  if (slug) {
    const cover = item && typeof item.cover_url === "string" ? item.cover_url : "";
    const gallery: string[] = item && Array.isArray(item.gallery) ? item.gallery : [];
    const f = item ? fmtDate(item.published_at) : { date: "", time: "" };
    return (
      <Shell activeUrl="/novosti" footer="row">
        <Hero title={badge} crumbs={[{ label: home, href: "/" }, { label: badge, href: "/novosti/" }, { label: item ? pick(item.title, lang) : "…" }]} />
        <div className="wrap" style={{ padding: "44px 40px 0", maxWidth: 900 }}>
          <a href="/novosti/" style={{ fontSize: 14, fontWeight: 700, color: "#0b3b6b" }}>{back}</a>
          {notFound ? (
            <div style={{ padding: "40px 0", color: "#7286a0" }}>{nf}</div>
          ) : !item ? (
            <div style={{ padding: "40px 0", color: "#7286a0" }}>…</div>
          ) : (
            <>
              <div style={{ margin: "16px 0 8px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#8798ad", fontWeight: 700 }}>
                <span style={{ background: "#5b8def", color: "#fff", padding: "4px 12px", borderRadius: 16 }}>{pick(item.category, lang) || badge}</span>
                <span>{f.date}</span>{f.time && <><span style={{ color: "#c8d3e0" }}>•</span><span>{f.time}</span></>}
              </div>
              <h1 style={{ fontFamily: "'PT Serif',serif", fontSize: 30, fontWeight: 700, color: "#1b2c44", lineHeight: 1.3, margin: "8px 0 20px" }}>{pick(item.title, lang)}</h1>
              {cover && <img src={cover} alt="" style={{ width: "100%", borderRadius: 14, marginBottom: 22, display: "block" }} />}
              {pick(item.excerpt, lang) && <p style={{ fontSize: 16.5, color: "#33465e", lineHeight: 1.7, fontWeight: 700 }}>{pick(item.excerpt, lang)}</p>}
              <div style={{ fontSize: 15.5, color: "#3a4c64", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{pick(item.body, lang)}</div>
              {gallery.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 24 }}>
                  {gallery.map((g, i) => <img key={i} src={g} alt="" style={{ width: "100%", borderRadius: 10, display: "block" }} />)}
                </div>
              )}
            </>
          )}
        </div>
        <FeedbackSplit sourcePage="novosti" />
      </Shell>
    );
  }

  // ---- Список новостей ----
  return (
    <Shell activeUrl="/novosti" footer="row">
      <Hero title={heroTitle} crumbs={[{ label: home, href: "/" }, { label: badge }]} />
      <div className="wrap" style={{ padding: "52px 40px 8px" }}>
        <div className="news-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {list.map((n) => {
            const f = fmtDate(n.published_at);
            const cover = typeof n.cover_url === "string" ? n.cover_url : "";
            return (
              <a key={n.id} href={`/novosti/?slug=${encodeURIComponent(n.slug)}`} className="news-card clk" style={{ border: "1px solid #e6ecf3", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 2px 10px rgba(11,59,107,.05)", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 210, background: cover ? `#e4ebf3 url(${cover}) center/cover` : "repeating-linear-gradient(135deg,#e4ebf3 0 14px,#eef3f9 14px 28px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8ba1bd", fontSize: 24, position: "relative" }}>
                  {!cover && "📷"}
                  <span style={{ position: "absolute", top: 14, right: 14, background: "#5b8def", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "5px 14px", borderRadius: 16, letterSpacing: ".02em" }}>{pick(n.category, lang) || badge}</span>
                </div>
                <div style={{ padding: "22px 22px 0", flex: 1 }}>
                  <div style={{ fontFamily: "'PT Serif',serif", fontSize: 16.5, fontWeight: 700, color: "#1b2c44", lineHeight: 1.35 }}>{pick(n.title, lang)}</div>
                </div>
                <div style={{ padding: "16px 22px 20px", marginTop: 14, borderTop: "1px solid #eef2f7", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#8798ad", fontWeight: 700 }}>
                  <span>{f.date}</span>{f.time && <><span style={{ color: "#c8d3e0" }}>•</span><span>{f.time}</span></>}
                </div>
              </a>
            );
          })}
        </div>
      </div>
      <FeedbackSplit sourcePage="novosti" />
    </Shell>
  );
}
