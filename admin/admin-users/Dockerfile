# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# build-time переменные (домен API, ключ сайта, ссылка ATS)
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_SITE_KEY
ARG NEXT_PUBLIC_ATS_URL
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_SITE_KEY=$NEXT_PUBLIC_SITE_KEY
ENV NEXT_PUBLIC_ATS_URL=$NEXT_PUBLIC_ATS_URL

COPY package*.json ./
RUN npm install
COPY . .
# next build с output:'export' кладёт готовую статику в ./out
RUN npm run build

# ---------- runtime stage: раздаём статику nginx-ом ----------
FROM nginx:1.27-alpine
COPY --from=build /app/out /usr/share/nginx/html
# SPA/静态: отдаём index при 404 на маршруты
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  location / { try_files $uri $uri/ $uri.html /index.html; }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
