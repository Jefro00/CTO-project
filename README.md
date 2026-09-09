# AUTOMOTIVE OS — Multi-Tenant SaaS ERP/CRM для СТО

![AUTOMOTIVE OS](https://img.shields.io/badge/AUTOMOTIVE%20OS-v1.0.0--MVP-4f46e5?style=for-the-badge)
![Status](https://img.shields.io/badge/Acceptance%20Tests-30%2F30%20PASSED-emerald?style=for-the-badge)
![Platform](https://img.shields.io/badge/Architecture-Vehicle--Centric-0ea5e9?style=for-the-badge)

**AUTOMOTIVE OS** — это специализированная многопользовательская облачная система управления автосервисом (СТО), в которой **автомобиль (Vehicle) является центральной сущностью всей операционной деятельности и формирует единую цифровую историю обслуживания**.

---

## 🎯 Основной пользовательский сценарий (End-to-End Workflow)
```
Клиент приехал на СТО
       ↓
Мастер открывает "Новая приемка" (Web / Mobile)
       ↓
Выбор / создание клиента и автомобиля (VIN, госномер, пробег, топливо)
       ↓
Осмотр кузова и салона по чек-листу + фиксация фото/видео
       ↓
Интерактивная расстановка отметок повреждений (Damage Markers X/Y)
       ↓
Завершение приемки → Автоматическое открытие Заказ-наряда
       ↓
Назначение работ и запчастей мастеру-механику
       ↓
Выполнение работ и фиксация в системе
       ↓
Генерация официальных документов (Акт приема-передачи, Акт выполненных работ, Счет)
       ↓
Закрытие заказа → Автоматическое обновление единой цифровой истории автомобиля (Timeline)
```

---

## 🏗️ Архитектура и стек технологий

```
                    ┌────────────────────┐
                    │    Web / Desktop   │
                    │ Next.js + React    │
                    └─────────┬──────────┘
                              │
                              │ HTTPS
                              │
┌────────────────────┐        ▼
│ Android / iOS      │───► API Gateway
│ Flutter            │        │
└────────────────────┘        ▼
                       ┌───────────────┐
                       │ NestJS API    │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        PostgreSQL           Redis          Object Storage
              │                │                │
              │                │                │
              ▼                ▼                ▼
          Business         Queues          Photos/Video
           Data            Workers          Documents
```

- **Backend**: Node.js + TypeScript + NestJS + PostgreSQL / SQLite embedded engine + WebSocket (`/ws`) + Swagger OpenAPI (`/api/docs`).
- **Web Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS + TanStack Query + Zustand + Lucide Icons + Responsive UI + Mobile Smartphone Simulator Mode.
- **Mobile Client**: Flutter (Clean Architecture: `core/`, `features/`, `shared/`, `services/`) + Drift/SQLite offline sync queue + Camera Service.
- **Monorepo Packages**: `@automotive-os/types`, `@automotive-os/permissions`, `@automotive-os/config`, `@automotive-os/api-client`.

---

## ⚡ Быстрый запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Заполнение базы данных тестовыми данными (Seed)
```bash
npm run seed
```

### 3. Запуск приемочного тестирования (30/30 шагов)
```bash
npm run test:acceptance
```

### 4. Запуск бэкенда и веб-интерфейса
```bash
npm run dev
# API: http://localhost:4000
# Web: http://localhost:3000
# Swagger: http://localhost:4000/api/docs
# Health: http://localhost:4000/health
```

---

## 👤 Тестовые учетные записи (Пароль: `Password123!`)

| Роль | Email | Доступ |
| :--- | :--- | :--- |
| 👑 **Владелец (Owner)** | `owner@example.local` | Полный доступ ко всем филиалам, бэкапам и аудиту |
| 🏢 **Руководитель (Manager)** | `manager@example.local` | Управление филиалом СТО №1, отчеты, аналитика |
| 📋 **Мастер-приемщик (Advisor)** | `advisor@example.local` | Приемка авто, фото/видео, оформление заказ-нарядов |
| 🔧 **Механик (Mechanic)** | `mechanic@example.local` | Выполнение назначенных работ и заказ-нарядов |
| 📄 **Документовед** | `documents@example.local` | Договоры, акты приема-передачи, счета |
| 👁️ **Наблюдатель (Viewer)** | `viewer@example.local` | Только просмотр |

---

## 📋 Проверка критериев готовности (Definition of Done)

- [x] **Multi-Tenancy & Scoping**: Полная изоляция по Organization, Location, User.
- [x] **Vehicle Centric Model**: Цифровая история автомобиля (Timeline) объединяет осмотры, заказы, фото, видео, акты, задачи и напоминания.
- [x] **New Inspection Wizard**: Пошаговый мастер приемки с индикатором топлива и чек-листами кузова/салона.
- [x] **Damage Marking Canvas**: Интерактивная векторная схема автомобиля с кликабельными маркерами повреждений.
- [x] **Work Order Lifecycle**: Расчет стоимости работ и запчастей, статусы (`Согласовать` → `В работу` → `Завершить` → `Закрыть`).
- [x] **Printable Documents**: Официальные формы РФ (Заказ-наряд, Акт приема-передачи ТС, Акт выполненных работ, Счет).
- [x] **Real-time WebSockets**: Подписка на события в `/ws`.
- [x] **Immutable Audit Logs**: Фиксация всех критических действий.
- [x] **Organization Backups**: Создание и восстановление архивных пакетов `.aosbackup`.
- [x] **Security Acceptance**: Все 4 теста безопасности пройдены (Tenant isolation, Location scope, RBAC, Anti-spoofing).
