/** @type {import('next').NextConfig} */

// Гибридный деплой:
//  - по умолчанию output:'export' → чистая статика, раздаётся nginx-ом,
//    ничего не «падает» на нестабильном сервере;
//  - динамический контент (новости) фронт тянет с /api в браузере.
// Чтобы переключить на SSR — убрать output:'export' и в Dockerfile
// заменить сборку статики на `next start`.
const nextConfig = {
  output: 'export',
  images: { unoptimized: true }, // export не умеет image-optimization на лету
  trailingSlash: true,
};

module.exports = nextConfig;
