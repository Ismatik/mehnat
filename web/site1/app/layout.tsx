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

export const metadata = {
  title: SITE_MARK,
  description: "Государственное учреждение · Республика Таджикистан",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* build-time дефолт акцента по сайту (без вспышки); рантайм из settings его переопределит */}
        <style dangerouslySetInnerHTML={{ __html: `:root{--accent:${DEFAULT_ACCENT};}` }} />
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
