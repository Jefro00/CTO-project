# AUTOMOTIVE OS — Инструкция по развертыванию

## Быстрый старт через Docker Compose

```bash
# 1. Клонировать репозиторий и настроить переменные окружения
cp .env.example .env

# 2. Запустить все сервисы (API, Web, PostgreSQL, Redis, MinIO)
docker-compose up --build -d

# 3. Применить сиды тестовых данных
npm run seed
```

## Локальный запуск без Docker

```bash
# Установка зависимостей
npm install

# Заполнение тестовой базы (JEFRO AUTO)
npm run seed

# Запуск API бэкенда (порт 4000)
npm run dev:api

# Запуск Web фронтенда (порт 3000)
npm run dev:web

# Запуск acceptance тестов
npm run test:acceptance
```

## Доступные интерфейсы
- **Web-приложение**: `http://localhost:3000`
- **Swagger OpenAPI**: `http://localhost:4000/api/docs`
- **Health Check**: `http://localhost:4000/health`
- **MinIO Console**: `http://localhost:9001`
