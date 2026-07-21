// Реестр соцсетей и фильтр заполненных ссылок — ОДНА логика для UI и автотестов.
// Расширяемо: добавить соцсеть = одна строка тут + case в SocialIcon (chrome.tsx).
// Иконка рендерится, только если settings[key] непустой (без href="#").

export const SOCIALS = [
  { kind: "facebook", key: "facebook_url", brand: "#1877f2", label: "Facebook" },
  { kind: "instagram", key: "instagram_url", brand: "#e1306c", label: "Instagram" },
  { kind: "youtube", key: "youtube_url", brand: "#ff0000", label: "YouTube" },
  { kind: "telegram", key: "telegram_url", brand: "#229ed9", label: "Telegram" },
];

export function socialLinks(settings) {
  const s = settings || {};
  return SOCIALS.map((x) => ({
    ...x,
    url: typeof s[x.key] === "string" ? s[x.key].trim() : "",
  })).filter((x) => x.url);
}
