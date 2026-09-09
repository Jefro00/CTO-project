# AUTOMOTIVE OS — API Справочник

Все REST API эндпоинты версионируются как `/api/v1/`.

## Swagger OpenAPI Документация
Доступна по адресу: `http://localhost:4000/api/docs`

## Основные эндпоинты

### 1. Авторизация (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Регистрация новой организации и владельца
- `POST /api/v1/auth/login` — Авторизация и получение JWT Access/Refresh токенов
- `POST /api/v1/auth/refresh` — Ротация refresh-токена
- `GET /api/v1/auth/me` — Профиль текущего пользователя и матрица прав

### 2. Автомобили (`/api/v1/vehicles`)
- `GET /api/v1/vehicles` — Список с фильтрацией (make, model, year, vin, plate)
- `POST /api/v1/vehicles` — Регистрация авто (уникальность VIN в организации)
- `GET /api/v1/vehicles/:id` — Карточка автомобиля
- `GET /api/v1/vehicles/:id/history` — Агрегированная цифровая история (Timeline)
- `GET /api/v1/vehicles/search?q=` — Поиск по VIN, номеру, владельцу, телефону

### 3. Приемка и осмотры (`/api/v1/inspections`)
- `GET /api/v1/inspections` — Журнал осмотров
- `POST /api/v1/inspections` — Создание осмотра с чек-листом кузова и салона
- `POST /api/v1/inspections/:id/complete` — Завершение осмотра
- `GET /api/v1/inspections/:id/items` — Позиции чек-листа

### 4. Заказ-наряды (`/api/v1/work-orders`)
- `GET /api/v1/work-orders` — Список заказов с фильтром по статусу
- `POST /api/v1/work-orders` — Создание заказа с автонумерацией
- `POST /api/v1/work-orders/:id/approve` — Согласование заказа
- `POST /api/v1/work-orders/:id/start` — Перевод в работу цеха
- `POST /api/v1/work-orders/:id/complete` — Завершение всех работ
- `POST /api/v1/work-orders/:id/close` — Закрытие заказа и обновление пробега
- `POST /api/v1/work-orders/:id/items` — Добавление работы / запчасти с автопересчетом

### 5. Документы (`/api/v1/documents`)
- `GET /api/v1/documents` — Реестр документов
- `POST /api/v1/documents/generate` — Генерация актов и заказ-нарядов с автозаполнением

### 6. Поиск, Аудит, Бэкапы, Здоровье
- `GET /api/v1/search?q=` — Глобальный поиск
- `GET /api/v1/audit` — Неизменяемый журнал аудита
- `POST /api/v1/backups` — Создание пакета `.aosbackup`
- `POST /api/v1/backups/:id/restore` — Восстановление организации с подтверждением
- `GET /health` — Проверка статуса сервисов
