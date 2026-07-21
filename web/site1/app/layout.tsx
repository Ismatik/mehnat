import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "../components/providers";

// Метка сайта в title вкладки (по ключу сборки) — чтобы не путать вкладки s1/s2.
// После загрузки настроек title заменяется реальным site_title + доменом (провайдер).
const SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY || "s1";
const SITE_MARK = SITE_KEY === "s2" ? "a-khorijakor.tj · site2" : "mmashvarat.tj · site1";

// Дефолт акцента задаётся НА ЭТАПЕ СБОРКИ по ключу сайта (site1 красный, site2
// зелёный), чтобы не было вспышки цвета. В рантайме провайдер переопределяет его
// значением settings.accent_color (менять цвет из админки без пересборки).
const DEFAULT_ACCENT = SITE_KEY === "s2" ? "#0e7a5e" : "#d52b1e";

// Фавиконка сайта — буква на цветном квадрате (тот же стиль и цвет, что у
// парной админки): site1 «М» на красном, site2 «Х» на зелёном. Пара сайт↔админка.
const BRAND = SITE_KEY === "s2" ? { letter: "Х", color: "#0e7a5e" } : { letter: "М", color: "#d52b1e" };
const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${BRAND.color}"/><text x="32" y="46" font-family="Georgia,'PT Serif',serif" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">${BRAND.letter}</text></svg>`
  );

export const metadata = {
  title: SITE_MARK,
  description: "Государственное учреждение · Республика Таджикистан",
  icons: { icon: FAVICON },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* build-time дефолт акцента по сайту (без вспышки); рантайм из settings его переопределит */}
        <style dangerouslySetInnerHTML={{ __html: `:root{--accent:${DEFAULT_ACCENT};}` }} />
        <link rel="icon" href={FAVICON} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
