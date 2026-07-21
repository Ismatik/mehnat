"use client";

// Форма «Связаться с нами» — синяя панель из макета. POST в
// /public/{site}/contact_messages с source_page. После отправки — состояние
// «Спасибо за обращение!». Тексты-подписи переключаются по языку.

import { useState } from "react";
import { sendContact } from "../lib/api";
import { useLang } from "./providers";
import type { Lang } from "../lib/i18n";

const T: Record<string, Record<Lang, string>> = {
  title: { ru: "Связаться с нами", tg: "Бо мо дар тамос шавед", en: "Contact us" },
  name: { ru: "Имя:", tg: "Ном:", en: "Name:" },
  email: { ru: "Почта:", tg: "Почта:", en: "Email:" },
  message: { ru: "Сообщение:", tg: "Паём:", en: "Message:" },
  send: { ru: "Отправить", tg: "Фиристодан", en: "Send" },
  thanks: { ru: "Спасибо за обращение!", tg: "Ташаккур барои муроҷиат!", en: "Thank you for your message!" },
  thanksText: {
    ru: "Мы получили ваше сообщение и свяжемся с вами в ближайшее время.",
    tg: "Мо паёми шуморо гирифтем ва ба зудӣ бо шумо дар тамос мешавем.",
    en: "We have received your message and will contact you shortly.",
  },
  again: { ru: "Отправить ещё одно →", tg: "Боз як бор фиристодан →", en: "Send another →" },
  error: { ru: "Не удалось отправить. Попробуйте ещё раз.", tg: "Фиристодан нашуд. Бори дигар кӯшиш кунед.", en: "Failed to send. Please try again." },
};

export default function FeedbackForm({ sourcePage }: { sourcePage: string }) {
  const { lang } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const t = (k: string) => T[k][lang];

  const inputStyle: React.CSSProperties = {
    border: "none", borderRadius: 30, padding: "16px 24px", fontSize: 15,
    fontFamily: "inherit", color: "#1b2c44", outline: "none", background: "#fff",
  };

  async function submit() {
    if (!name.trim() || !message.trim()) {
      setError(true);
      return;
    }
    setBusy(true);
    setError(false);
    try {
      await sendContact({ name: name.trim(), email: email.trim(), message: message.trim(), source_page: sourcePage });
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,.16)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>✓</div>
        <div style={{ fontFamily: "'PT Serif',serif", fontSize: 26, fontWeight: 700 }}>{t("thanks")}</div>
        <div style={{ fontSize: 15, color: "#cfe0f2", lineHeight: 1.55, maxWidth: 380 }}>{t("thanksText")}</div>
        <span
          className="clk"
          onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}
          style={{ marginTop: 4, fontSize: 14.5, color: "#fff", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          {t("again")}
        </span>
      </div>
    );
  }

  return (
    <>
      <div style={{ fontFamily: "'PT Serif',serif", fontSize: 30, fontWeight: 700, letterSpacing: ".01em" }}>{t("title")}</div>
      <div style={{ width: 64, height: 4, background: "var(--accent)", borderRadius: 3, margin: "14px 0 26px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input placeholder={t("name")} value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        <input placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <textarea placeholder={t("message")} value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...inputStyle, borderRadius: 20, minHeight: 130, resize: "vertical" }} />
      </div>
      {error && <div style={{ marginTop: 12, color: "#ffd7d2", fontSize: 13.5 }}>{t("error")}</div>}
      <button
        className="submit"
        onClick={submit}
        disabled={busy}
        style={{ marginTop: 22, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 30, padding: 16, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
      >
        {busy ? "…" : t("send")} <span style={{ fontSize: 17 }}>→</span>
      </button>
    </>
  );
}
