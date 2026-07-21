# ---------- build stage ----------
FROM golang:1.25-alpine AS build
WORKDIR /src

# Кэшируем зависимости отдельным слоем
COPY go.mod go.sum* ./
RUN go mod download 2>/dev/null || true

# Копируем исходники и собираем статический бинарь
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/server ./cmd/server

# ---------- runtime stage ----------
FROM alpine:3.20
RUN apk add --no-cache wget ca-certificates
WORKDIR /app
COPY --from=build /out/server /app/server
# Миграции кладём рядом, чтобы можно было прогонять из контейнера
COPY migrations /app/migrations

EXPOSE 8080
ENTRYPOINT ["/app/server"]
