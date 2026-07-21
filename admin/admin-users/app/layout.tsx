import "./globals.css";
import type { ReactNode } from "react";

// Значок общей админки пользователей: буква «П» на нейтральном синем.
const BRAND = { letter: "П", color: "#0b3b6b" };
const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${BRAND.color}"/><text x="32" y="46" font-family="Georgia,'PT Serif',serif" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">${BRAND.letter}</text></svg>`
  );

export const metadata = {
  title: "МЕХНАТ — Управление пользователями",
  description: "Общая административная панель управления пользователями",
  icons: { icon: FAVICON },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href={FAVICON} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
