"use client";

// /kontakty — карточки (телефоны/почта/адрес) + карта+форма + региональные центры.

import { useEffect, useState } from "react";
import { Shell, Hero } from "../../components/chrome";
import FeedbackForm from "../../components/FeedbackForm";
import { useLang, useSiteData } from "../../components/providers";
import { listResource, type Row } from "../../lib/api";
import { pick } from "../../lib/i18n";

export default function Page() {
  const { lang } = useLang();
  const { settings } = useSiteData();
  const [centers, setCenters] = useState<Row[]>([]);

  useEffect(() => {
    listResource("centers").then(setCenters).catch(() => setCenters([]));
  }, []);

  const L = {
    hero: { ru: "Контакты", tg: "Тамос", en: "Contacts" }[lang],
    home: { ru: "Главная", tg: "Асосӣ", en: "Home" }[lang],
    phones: { ru: "Телефоны", tg: "Телефонҳо", en: "Phones" }[lang],
    hours: { ru: "Пн–Пт, 8:00–17:00", tg: "Дш–Ҷм, 8:00–17:00", en: "Mon–Fri, 8:00–17:00" }[lang],
    email: { ru: "Электронная почта", tg: "Почтаи электронӣ", en: "Email" }[lang],
    emailNote: { ru: "Ответим в рабочее время", tg: "Дар вақти корӣ ҷавоб медиҳем", en: "We reply during working hours" }[lang],
    addr: { ru: "Адрес", tg: "Суроға", en: "Address" }[lang],
    regional: { ru: "Региональные центры", tg: "Марказҳои минтақавӣ", en: "Regional centers" }[lang],
    regionalNote: { ru: "Обратитесь в ближайший центр — консультация бесплатна.", tg: "Ба маркази наздиктарин муроҷиат кунед — машварат ройгон аст.", en: "Contact the nearest center — consultation is free." }[lang],
    plans: { ru: "Планируется открытие центров в городах Куляб, Вахдат, Гиссар и Дангара.", tg: "Кушодани марказҳо дар шаҳрҳои Кӯлоб, Ваҳдат, Ҳисор ва Данғара ба нақша гирифта шудааст.", en: "New centers are planned in Kulob, Vahdat, Hisor and Danghara." }[lang],
  };

  const phone1 = settings.phone_1 || "225-05-75";
  const phone2 = settings.phone_2 || "225-02-21";
  const email = settings.email || "info@markaz.tj";
  const address = pick(settings.address, lang) || "г. Душанбе";

  const cards = [
    { icon: "☎", title: L.phones, line1: `${phone1} · ${phone2}`, line2: L.hours },
    { icon: "✉", title: L.email, line1: email, line2: L.emailNote },
    { icon: "📍", title: L.addr, line1: address, line2: pick(settings.site_subtitle, lang) || "Республика Таджикистан" },
  ];

  return (
    <Shell activeUrl="/kontakty" footer="row">
      <Hero title={L.hero} crumbs={[{ label: L.home, href: "/" }, { label: L.hero }]} />

      <div className="wrap" style={{ padding: "52px 40px 0" }}>
        <div className="contact-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
          {cards.map((c, i) => (
            <div key={i} className="card-hover" style={{ border: "1px solid #e6ecf3", borderRadius: 14, padding: "30px 28px", background: "#fff", textAlign: "center", boxShadow: "0 4px 18px rgba(11,59,107,.07)" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#eef3f9", color: "#0b3b6b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>{c.icon}</div>
              <div style={{ fontFamily: "'PT Serif',serif", fontSize: 19, fontWeight: 700, color: "#0b3b6b", marginBottom: 10 }}>{c.title}</div>
              <div style={{ fontSize: 15, color: "#33465e", lineHeight: 1.6, fontWeight: 700 }}>{c.line1}</div>
              <div style={{ fontSize: 14, color: "#7286a0", lineHeight: 1.6, marginTop: 2 }}>{c.line2}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ padding: "44px 40px 0" }}>
        <div className="mapform" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", borderRadius: 16, overflow: "hidden", boxShadow: "0 14px 40px rgba(11,59,107,.16)" }}>
          <div className="map-pane" style={{ position: "relative", minHeight: 520, backgroundImage: "repeating-linear-gradient(135deg,#d3dfec 0 18px,#e4ebf3 18px 36px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-100%)" }}>
              <div style={{ width: 44, height: 44, position: "relative", transform: "rotate(-45deg)", background: "linear-gradient(135deg,#e2503f,#c0261a)", borderRadius: "50% 50% 50% 0", boxShadow: "0 8px 16px rgba(11,59,107,.3)" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", width: 16, height: 16, transform: "translate(-50%,-50%) rotate(45deg)", borderRadius: "50%", background: "#fff" }} />
              </div>
            </div>
          </div>
          <div style={{ background: "#0b3b6b", color: "#fff", padding: "46px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <FeedbackForm sourcePage="kontakty" />
          </div>
        </div>
      </div>

      <div className="wrap" style={{ padding: "52px 40px 0" }}>
        <div style={{ fontFamily: "'PT Serif',serif", fontSize: 26, fontWeight: 700, color: "#0b3b6b", marginBottom: 6 }}>{L.regional}</div>
        <div style={{ fontSize: 14.5, color: "#5a6b80", marginBottom: 24 }}>{L.regionalNote}</div>
        <div className="centers-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {centers.map((c) => (
            <div key={c.id} style={{ border: "1px solid #e6ecf3", borderRadius: 12, padding: "22px 22px", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 34, height: 34, borderRadius: 8, background: "#0b3b6b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flex: "none" }}>📍</span>
                <div style={{ fontFamily: "'PT Serif',serif", fontSize: 18, fontWeight: 700, color: "#1b2c44" }}>{pick(c.city, lang)}</div>
              </div>
              <div style={{ fontSize: 13.5, color: "#5a6b80", lineHeight: 1.55, marginBottom: 10 }}>{pick(c.address, lang)}</div>
              <div style={{ borderTop: "1px solid #eef2f7", paddingTop: 10, fontSize: 13.5, color: "#0b3b6b", fontWeight: 700 }}>{c.phone}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#8798ad", marginTop: 14 }}>{L.plans}</div>
      </div>
    </Shell>
  );
}
