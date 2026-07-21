"use client";

// Секция «фото + синяя форма» в скруглённой карточке (novosti / o-nas / germany).

import FeedbackForm from "./FeedbackForm";
import { useSiteData } from "./providers";

export default function FeedbackSplit({ sourcePage }: { sourcePage: string }) {
  const { settings } = useSiteData();
  const photo = typeof settings.feedback_photo_url === "string" ? settings.feedback_photo_url : "";
  return (
    <div className="wrap" style={{ marginTop: 52, padding: "0 40px" }}>
      <div className="feedback" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", borderRadius: 16, overflow: "hidden", boxShadow: "0 14px 40px rgba(11,59,107,.18)" }}>
        <div
          className="feedback-photo"
          style={{
            position: "relative",
            minHeight: 440,
            background: photo ? `#c7d4e4 url(${photo}) center/cover` : "repeating-linear-gradient(135deg,#c7d4e4 0 16px,#d6e0ec 16px 32px)",
          }}
        />
        <div style={{ background: "#0b3b6b", color: "#fff", padding: "46px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <FeedbackForm sourcePage={sourcePage} />
        </div>
      </div>
    </div>
  );
}
