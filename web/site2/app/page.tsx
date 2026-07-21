"use client";

// Главная (index.html): hero-слайдер + фото Президента, новости, страны
// master-detail, «Чем поможем», warning, регистрация+Telegram (QR), contacts CTA.

import { useEffect, useRef, useState } from "react";
import { Shell, canonicalHref } from "../components/chrome";
import { useLang, useSiteData } from "../components/providers";
import { listResource, ATS_URL, type Row } from "../lib/api";
import { pick, type Lang } from "../lib/i18n";

const PRIMARY = "#0b3b6b";

function fmtDate(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: iso, time: "" };
  const p = (n: number) => String(n).padStart(2, "0");
  return { date: `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`, time: `${p(d.getHours())}:${p(d.getMinutes())}` };
}

// ---- Hero-слайдер ----
function HeroSlider({ slides, lang }: { slides: Row[]; lang: Lang }) {
  const [i, setI] = useState(0);
  const timer = useRef<any>(null);
  const n = slides.length;
  const badge = { ru: "Все услуги бесплатны", tg: "Ҳамаи хидматҳо ройгонанд", en: "All services are free" }[lang];

  useEffect(() => {
    if (n <= 1) return;
    const start = () => { stop(); timer.current = setInterval(() => setI((x) => (x + 1) % n), 5000); };
    const stop = () => timer.current && clearInterval(timer.current);
    start();
    return stop;
  }, [n]);

  if (n === 0) {
    return <div className="hero-slide" style={{ minHeight: 460, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.08) 0 16px,rgba(255,255,255,.03) 16px 32px)" }} />;
  }
  const go = (x: number) => setI((x + n) % n);

  return (
    <div className="hero-slide" style={{ position: "relative", minHeight: 460, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
      {slides.map((s, k) => (
        <div key={s.id} style={{ position: "absolute", inset: 0, opacity: k === i ? 1 : 0, transition: "opacity .7s ease", background: s.image_url ? `url(${s.image_url}) center/cover` : "repeating-linear-gradient(135deg,rgba(255,255,255,.08) 0 16px,rgba(255,255,255,.03) 16px 32px)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(8,32,58,.1) 0%,rgba(8,32,58,.55) 55%,rgba(8,32,58,.9) 100%)" }} />
          <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 1, padding: "40px 44px 52px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.28)", padding: "6px 13px", borderRadius: 30, fontSize: 12.5, letterSpacing: ".02em", color: "#fff" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7ec48a" }} />{badge}
            </div>
            <h1 style={{ fontFamily: "'PT Serif',serif", fontSize: 33, lineHeight: 1.18, margin: "16px 0 12px", fontWeight: 700, maxWidth: 520, color: (typeof s.title_color === "string" && s.title_color) || "#fff" }}>{pick(s.title, lang)}</h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#e2edf8", margin: "0 0 22px", maxWidth: 480 }}>{pick(s.subtitle, lang)}</p>
            {pick(s.cta_label, lang) && (
              <a href={s.cta_url || "#reg"} className="clk" style={{ display: "inline-block", background: "#fff", color: PRIMARY, fontWeight: 700, padding: "13px 26px", borderRadius: 5, fontSize: 15 }}>{pick(s.cta_label, lang)}</a>
            )}
          </div>
        </div>
      ))}
      {n > 1 && (
        <>
          <div style={{ position: "absolute", right: 24, bottom: 22, display: "flex", gap: 8, zIndex: 2 }}>
            {slides.map((_, k) => (
              <span key={k} className="clk" onClick={() => go(k)} style={{ width: 26, height: 5, borderRadius: 3, background: k === i ? "#fff" : "rgba(255,255,255,.4)" }} />
            ))}
          </div>
          <div className="clk" onClick={() => go(i - 1)} style={{ position: "absolute", top: 24, right: 60, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, zIndex: 2, color: "#fff" }}>‹</div>
          <div className="clk" onClick={() => go(i + 1)} style={{ position: "absolute", top: 24, right: 18, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, zIndex: 2, color: "#fff" }}>›</div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const { lang } = useLang();
  const { settings } = useSiteData();
  const [sliders, setSliders] = useState<Row[]>([]);
  const [news, setNews] = useState<Row[]>([]);
  const [countries, setCountries] = useState<Row[]>([]);
  const [help, setHelp] = useState<Row[]>([]);
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    listResource("sliders").then(setSliders).catch(() => {});
    listResource("news").then((r) => setNews(r.slice(0, 3))).catch(() => {});
    listResource("countries").then((r) => { setCountries(r); if (r[0]) setSel(r[0].id); }).catch(() => {});
    listResource("help_items").then(setHelp).catch(() => {});
  }, []);

  const L = {
    presidentLabel: pick(settings.president_label, lang) || { ru: "Президент Республики Таджикистан", tg: "Президенти Ҷумҳурии Тоҷикистон", en: "President of the Republic of Tajikistan" }[lang],
    newsTitle: { ru: "Новости", tg: "Хабарҳо", en: "News" }[lang],
    allNews: { ru: "Все новости →", tg: "Ҳамаи хабарҳо →", en: "All news →" }[lang],
    where: { ru: "Куда можно поехать", tg: "Ба куҷо рафтан мумкин аст", en: "Where you can go" }[lang],
    whereSub: { ru: "Выберите страну — узнайте условия, реальный заработок и порядок выезда.", tg: "Кишварро интихоб кунед — шароит, даромади воқеӣ ва тартиби сафарро бидонед.", en: "Choose a country — learn the conditions, real earnings and procedure." }[lang],
    addedVia: { ru: "+ Добавляется через админ-панель", tg: "+ Аз панели идора илова мешавад", en: "+ Managed via admin panel" }[lang],
    helpTitle: { ru: "Чем мы вам поможем", tg: "Мо ба шумо чӣ гуна кӯмак мекунем", en: "How we help you" }[lang],
    earn: { ru: "Реальный заработок", tg: "Даромади воқеӣ", en: "Real earnings" }[lang],
    docs: { ru: "Нужные документы", tg: "Ҳуҷҷатҳои зарурӣ", en: "Required documents" }[lang],
    order: { ru: "Порядок выезда", tg: "Тартиби баромадан", en: "Departure procedure" }[lang],
    contactsTitle: { ru: "Свяжитесь с нами", tg: "Бо мо дар тамос шавед", en: "Contact us" }[lang],
    contactsText: { ru: "Есть вопросы? Приходите в наш центр или позвоните. Консультация бесплатна.", tg: "Савол доред? Ба маркази мо биёед ё занг занед. Машварат ройгон аст.", en: "Have questions? Visit our center or call. Consultation is free." }[lang],
    phonesFor: { ru: "Телефоны для связи", tg: "Телефонҳо барои тамос", en: "Contact phones" }[lang],
    allAddresses: { ru: "Все адреса →", tg: "Ҳамаи суроғаҳо →", en: "All addresses →" }[lang],
    read: { ru: "Читать →", tg: "Хондан →", en: "Read →" }[lang],
    condFor: { ru: "Условия выезда в страну", tg: "Шароити баромадан ба кишвари", en: "Conditions for" }[lang],
  };

  const selected = countries.find((c) => c.id === sel) || countries[0];
  const phone1 = settings.phone_1 || "225-05-75";
  const phone2 = settings.phone_2 || "225-02-21";
  const presPhoto = typeof settings.president_photo_url === "string" ? settings.president_photo_url : "";
  const presUrl = typeof settings.president_url === "string" ? settings.president_url : "https://www.president.tj";
  const atsUrl = (typeof settings.ats_url === "string" && settings.ats_url) || ATS_URL || "#";
  const qrReg = typeof settings.qr_registration_url === "string" ? settings.qr_registration_url : "";
  const qrTg = typeof settings.qr_telegram_url === "string" ? settings.qr_telegram_url : "";
  const tgUrl = (typeof settings.telegram_url === "string" && settings.telegram_url) || "#";
  const tgHandle = (typeof settings.telegram_handle === "string" && settings.telegram_handle) || "@____________";

  return (
    <Shell activeUrl="/" footer="full">
      {/* hero */}
      <div style={{ background: PRIMARY, color: "#fff" }}>
        <div className="wrap hero-grid" style={{ padding: 0, display: "grid", gridTemplateColumns: "1.15fr .85fr" }}>
          <HeroSlider slides={sliders} lang={lang} />
          <div style={{ background: "#08305a", padding: "36px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18, borderLeft: "1px solid rgba(255,255,255,.1)" }}>
            {presPhoto ? (
              <img src={presPhoto} alt={L.presidentLabel} style={{ width: 172, height: 214, borderRadius: 6, border: "1px solid rgba(255,255,255,.25)", objectFit: "cover", objectPosition: "50% 20%", flex: "none", display: "block" }} />
            ) : (
              <div style={{ width: 172, height: 214, borderRadius: 6, border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9fc0e4", fontSize: 13, flex: "none" }}>{{ ru: "фото", tg: "акс", en: "photo" }[lang]}</div>
            )}
            <div>
              <div style={{ fontSize: 12, letterSpacing: ".04em", textTransform: "uppercase", color: "#9fc0e4", fontWeight: 700, marginBottom: 8 }}>{L.presidentLabel}</div>
              <div style={{ fontFamily: "'PT Serif',serif", fontSize: 16, color: "#eaf2fb", lineHeight: 1.5, maxWidth: 340 }}>{pick(settings.president_caption, lang)}</div>
            </div>
            <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 16, width: "100%" }}>
              <a href={presUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 14.5 }}>
                {presUrl.replace(/^https?:\/\//, "")} <span style={{ color: "#9fc0e4" }}>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* news */}
      <div className="wrap" style={{ padding: "44px 40px 8px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'PT Serif',serif", fontSize: 26, fontWeight: 700, color: PRIMARY }}>{L.newsTitle}</div>
            <div style={{ width: 54, height: 3, background: "var(--accent)", borderRadius: 3, marginTop: 8 }} />
          </div>
          <a href="/novosti/" style={{ fontSize: 14, fontWeight: 700, color: PRIMARY }}>{L.allNews}</a>
        </div>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {news.map((n) => {
            const f = fmtDate(n.published_at);
            const cover = typeof n.cover_url === "string" ? n.cover_url : "";
            return (
              <a key={n.id} href={`/novosti/?slug=${encodeURIComponent(n.slug)}`} className="hov-card clk" style={{ border: "1px solid #e0e7f0", borderRadius: 7, overflow: "hidden", background: "#fff", display: "block" }}>
                <div style={{ height: 150, background: cover ? `#e4ebf3 url(${cover}) center/cover` : "repeating-linear-gradient(135deg,#e4ebf3 0 14px,#eef3f9 14px 28px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8ba1bd", fontSize: 20 }}>{!cover && "📷"}</div>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 12, color: "#8798ad", letterSpacing: ".03em" }}>{f.date}{f.time && ` · ${f.time}`}</div>
                  <div style={{ fontFamily: "'PT Serif',serif", fontSize: 16.5, fontWeight: 700, color: "#1b2c44", lineHeight: 1.3, marginTop: 6 }}>{pick(n.title, lang)}</div>
                  <div style={{ fontSize: 13, color: PRIMARY, fontWeight: 700, marginTop: 12 }}>{L.read}</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* countries master-detail */}
      <div className="wrap" style={{ padding: "44px 40px 8px" }}>
        <div style={{ fontFamily: "'PT Serif',serif", fontSize: 26, fontWeight: 700, color: PRIMARY }}>{L.where}</div>
        <div style={{ width: 54, height: 3, background: "var(--accent)", borderRadius: 3, marginTop: 8 }} />
        <div style={{ fontSize: 14.5, color: "#5a6b80", margin: "10px 0 20px" }}>{L.whereSub}</div>
        <div className="md-grid" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {countries.map((c) => {
              const d = (c.description && typeof c.description === "object" ? c.description : {}) as Row;
              const active = c.id === (selected?.id);
              return (
                <div key={c.id} onClick={() => setSel(c.id)} className={active ? "clk" : "hov-card clk"} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 15px", borderRadius: 8, background: active ? PRIMARY : "#fff", border: `1px solid ${active ? PRIMARY : "#e0e7f0"}`, boxShadow: active ? "0 4px 14px rgba(11,59,107,.22)" : undefined }}>
                  <div style={{ width: 44, height: 30, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flex: "none", background: active ? "rgba(255,255,255,.18)" : "#dbe5f1", color: active ? "#fff" : PRIMARY }}>{typeof d.code === "string" ? d.code : pick(c.name, lang).slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: active ? "#fff" : "#1b2c44" }}>{pick(c.name, lang)}</div>
                    <div style={{ fontSize: 12, marginTop: 2, color: active ? "#cfe0f2" : "#8798ad" }}>{pick(d.short, lang)}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 16, color: active ? "#fff" : "#c3cfdd" }}>›</span>
                </div>
              );
            })}
            <div style={{ fontSize: 13, color: "#8798ad", marginTop: 6 }}>{L.addedVia}</div>
          </div>

          <div style={{ border: "1px solid #e0e7f0", borderRadius: 8, overflow: "hidden", background: "#fff", minHeight: 360 }}>
            {selected && (() => {
              const d = (selected.description && typeof selected.description === "object" ? selected.description : {}) as Row;
              const steps: any[] = Array.isArray(d.steps) ? d.steps : [];
              return (
                <>
                  <div style={{ background: PRIMARY, color: "#fff", padding: "22px 26px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 60, height: 42, borderRadius: 5, background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flex: "none" }}>{typeof d.code === "string" ? d.code : ""}</div>
                    <div>
                      <div style={{ fontFamily: "'PT Serif',serif", fontSize: 23, fontWeight: 700, lineHeight: 1.1 }}>{pick(selected.name, lang)}</div>
                      <div style={{ fontSize: 13.5, color: "#cfe0f2", marginTop: 3 }}>{pick(d.tagline, lang)}</div>
                    </div>
                  </div>
                  <div style={{ padding: "24px 26px", display: "flex", flexDirection: "column", gap: 22 }}>
                    <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ background: "#f4f7fb", border: "1px solid #e6ecf3", borderRadius: 7, padding: "16px 18px" }}>
                        <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".05em", color: "#8798ad", fontWeight: 700 }}>{L.earn}</div>
                        <div style={{ fontFamily: "'PT Serif',serif", fontSize: 21, fontWeight: 700, color: "#1b6b3a", margin: "6px 0" }}>{typeof d.earnings === "string" ? d.earnings : pick(d.earnings, lang)}</div>
                        <div style={{ fontSize: 12.5, color: "#5a6b80", lineHeight: 1.45 }}>{pick(d.earnings_note, lang)}</div>
                      </div>
                      <div style={{ background: "#f4f7fb", border: "1px solid #e6ecf3", borderRadius: 7, padding: "16px 18px" }}>
                        <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".05em", color: "#8798ad", fontWeight: 700 }}>{L.docs}</div>
                        <div style={{ fontSize: 13.5, color: "#1b2c44", lineHeight: 1.5, marginTop: 8 }}>{pick(d.docs, lang)}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'PT Serif',serif", fontSize: 16, fontWeight: 700, color: PRIMARY, marginBottom: 12 }}>{L.order}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {steps.map((t, k) => (
                          <div key={k} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#e7eff8", color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5, flex: "none", marginTop: 1 }}>{k + 1}</div>
                            <div style={{ fontSize: 14, color: "#33465e", lineHeight: 1.45 }}>{pick(t, lang)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {pick(d.note, lang) && (
                      <div style={{ background: "#fdf4e7", border: "1px solid #eecb92", borderLeft: "4px solid #d68a1e", borderRadius: 6, padding: "13px 16px", display: "flex", gap: 11, alignItems: "flex-start" }}>
                        <span style={{ color: "#d68a1e", fontSize: 16, flex: "none", lineHeight: 1.4 }}>⚠</span>
                        <div style={{ fontSize: 13, color: "#6b5228", lineHeight: 1.5 }}>{pick(d.note, lang)}</div>
                      </div>
                    )}
                    {selected.available && selected.link_url && (
                      <div><a href={canonicalHref(selected.link_url)} className="clk" style={{ display: "inline-block", background: PRIMARY, color: "#fff", fontWeight: 700, padding: "11px 24px", borderRadius: 5, fontSize: 14 }}>{L.condFor} {pick(selected.name, lang)} →</a></div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* help */}
      <div className="wrap" style={{ padding: "44px 40px 8px" }}>
        <div style={{ fontFamily: "'PT Serif',serif", fontSize: 26, fontWeight: 700, color: PRIMARY }}>{L.helpTitle}</div>
        <div style={{ width: 54, height: 3, background: "var(--accent)", borderRadius: 3, margin: "8px 0 18px" }} />
        <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {help.map((h) => (
            <div key={h.id} className="hov-card" style={{ border: "1px solid #e0e7f0", borderRadius: 7, padding: 20, background: "#fff" }}>
              <div style={{ width: 42, height: 42, borderRadius: 6, background: "#e7eff8", color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{typeof h.icon === "string" ? h.icon : "•"}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1b2c44", marginBottom: 6 }}>{pick(h.title, lang)}</div>
              <div style={{ fontSize: 13.5, color: "#5a6b80", lineHeight: 1.5 }}>{pick(h.description, lang)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* warning */}
      <div className="wrap" style={{ padding: "36px 40px 8px" }}>
        <div style={{ background: "#fdf4e7", border: "1px solid #eecb92", borderLeft: "5px solid #d68a1e", borderRadius: 7, padding: "22px 26px", display: "flex", gap: 18, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#d68a1e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flex: "none" }}>⚠</div>
          <div>
            <div style={{ fontFamily: "'PT Serif',serif", fontSize: 19, fontWeight: 700, color: "#8a5a12", marginBottom: 6 }}>{pick(settings.warning_title, lang)}</div>
            <div style={{ fontSize: 14, color: "#6b5228", lineHeight: 1.55, maxWidth: 820 }}>{pick(settings.warning_text, lang)}</div>
            {pick(settings.warning_link, lang) && <div className="clk" style={{ fontSize: 13.5, color: "#8a5a12", fontWeight: 700, marginTop: 12 }}>{pick(settings.warning_link, lang)} →</div>}
          </div>
        </div>
      </div>

      {/* registration + telegram */}
      <div id="reg" className="wrap" style={{ padding: "44px 40px", scrollMarginTop: 20 }}>
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={{ background: PRIMARY, color: "#fff", borderRadius: 8, padding: "30px 32px", display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'PT Serif',serif", fontSize: 21, fontWeight: 700, marginBottom: 8 }}>{pick(settings.register_title, lang)}</div>
              <div style={{ fontSize: 13.5, color: "#cfe0f2", lineHeight: 1.55, marginBottom: 18 }}>{pick(settings.register_text, lang)}</div>
              <a href={atsUrl} target="_blank" rel="noopener noreferrer" className="clk" style={{ display: "inline-block", background: "#fff", color: PRIMARY, fontWeight: 700, padding: "11px 22px", borderRadius: 5, fontSize: 14 }}>{pick(settings.register_title, lang)}</a>
            </div>
            <div style={{ textAlign: "center", flex: "none" }}>
              {qrReg ? <img src={qrReg} alt="QR" style={{ width: 96, height: 96, borderRadius: 6, background: "#fff", padding: 5, objectFit: "contain", display: "block" }} /> : <div style={{ width: 96, height: 96, borderRadius: 6, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#8ba1bd", fontSize: 30 }}>▦</div>}
            </div>
          </div>
          <div style={{ background: "#eef3f9", border: "1px solid #dbe5f1", borderRadius: 8, padding: "30px 32px", display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 34, height: 34, borderRadius: 8, background: "#229ed9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✈</span>
                <div style={{ fontFamily: "'PT Serif',serif", fontSize: 21, fontWeight: 700, color: PRIMARY }}>{pick(settings.telegram_title, lang)}</div>
              </div>
              <div style={{ fontSize: 13.5, color: "#5a6b80", lineHeight: 1.55, marginBottom: 18 }}>{pick(settings.telegram_text, lang)}</div>
              <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="clk" style={{ display: "inline-block", background: "#229ed9", color: "#fff", fontWeight: 700, padding: "11px 22px", borderRadius: 5, fontSize: 14 }}>{tgHandle}</a>
            </div>
            <div style={{ textAlign: "center", flex: "none" }}>
              {qrTg ? <img src={qrTg} alt="QR" style={{ width: 96, height: 96, borderRadius: 6, background: "#fff", border: "1px solid #dbe5f1", padding: 5, objectFit: "contain", display: "block" }} /> : <div style={{ width: 96, height: 96, borderRadius: 6, background: "#fff", border: "1px solid #dbe5f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#8ba1bd", fontSize: 30 }}>▦</div>}
            </div>
          </div>
        </div>
      </div>

      {/* contacts CTA */}
      <div style={{ background: "#f4f7fb", borderTop: "1px solid #e2e9f2" }}>
        <div className="wrap contacts" style={{ padding: "34px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'PT Serif',serif", fontSize: 22, fontWeight: 700, color: PRIMARY }}>{L.contactsTitle}</div>
            <div style={{ width: 48, height: 3, background: "var(--accent)", borderRadius: 3, margin: "8px 0 0" }} />
            <div style={{ fontSize: 14, color: "#5a6b80", marginTop: 8 }}>{L.contactsText}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12.5, color: "#8798ad" }}>{L.phonesFor}</div>
              <div style={{ fontFamily: "'PT Serif',serif", fontSize: 22, fontWeight: 700, color: PRIMARY }}>{phone1} · {phone2}</div>
            </div>
            <a href="/kontakty/" style={{ border: `1.5px solid ${PRIMARY}`, color: PRIMARY, fontWeight: 700, padding: "11px 22px", borderRadius: 5, fontSize: 14 }}>{L.allAddresses}</a>
          </div>
        </div>
      </div>
    </Shell>
  );
}
