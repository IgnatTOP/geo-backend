# Используем официальный образ Go 1.23
FROM golang:1.23-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем go mod и sum файлы
COPY go.mod go.sum ./

# Скачиваем зависимости
RUN go mod download

# Копируем исходный код
COPY . .

# Собираем приложение
RUN go build -o main .

# Финальный образ
FROM alpine:latest

# Устанавливаем необходимые пакеты
# postgresql-client нужен для SSL библиотек при работе с PostgreSQL
RUN apk --no-cache add ca-certificates tzdata postgresql-client

WORKDIR /root/

# Копируем бинарник из builder
COPY --from=builder /app/main .

# Копируем SSL сертификат для подключения к БД
COPY --from=builder /app/certs ./certs

# Копируем директорию для загрузок (если нужно)
RUN mkdir -p uploads/images uploads/documents uploads/videos uploads/practices uploads/reports

# Открываем порт
EXPOSE 8080

# Запускаем приложение
# Используем переменную окружения PORT, если она установлена
CMD ["./main"]

