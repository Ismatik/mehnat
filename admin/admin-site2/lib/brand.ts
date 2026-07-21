// Брендирование админки контента по ключу сайта (для favicon, логотипа, title).
// site1 = «М» на красном (mmashvarat.tj), site2 = «Х» на зелёном (a-khorijakor.tj).
// Один код на обе админки — отличие только в NEXT_PUBLIC_SITE_KEY.

import { SITE_KEY } from "./api";

export const BRAND =
  SITE_KEY === "s2"
    ? { letter: "Х", color: "#0e7a5e", domain: "a-khorijakor.tj" }
    : { letter: "М", color: "#d52b1e", domain: "mmashvarat.tj" };

// SVG-значок «буква на цветном квадрате» как data-URI (для favicon вкладки).
export function faviconDataUri(letter: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="${color}"/>` +
    `<text x="32" y="46" font-family="Georgia,'PT Serif',serif" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text>` +
    `</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

export const FAVICON = faviconDataUri(BRAND.letter, BRAND.color);
