# AUTOMOTIVE OS — Схема базы данных (ERD)

## Основные сущности и связи
```
Organization (1) ───< Locations (N)
Organization (1) ───< Users (N)
Organization (1) ───< Customers (N)
Customer (1)     ───< Vehicles (N)
Vehicle (1)      ───< Inspections (N) ───< InspectionItems (N)
Vehicle (1)      ───< WorkOrders (N) ───< WorkOrderItems (N)
Vehicle (1)      ───< Media (N)
Vehicle (1)      ───< Documents (N)
Vehicle (1)      ───< Reminders (N)
Vehicle (1)      ───< Tasks (N)
Organization (1) ───< AuditLogs (N) [Immutable]
Organization (1) ───< Backups (N)
```

## Таблицы базы данных
1. `organizations`: Профиль организации, валюта, часовой пояс, реквизиты.
2. `locations`: Филиалы автосервиса, адреса, телефоны.
3. `users`: Сотрудники с привязкой к ролям и филиалам.
4. `roles` & `permissions`: 9 системных ролей и матрица гранулярных прав.
5. `customers`: Клиентская база СТО.
6. `vehicles`: Автопарк (уникальность VIN в рамках организации, пробег, госномер, характеристики).
7. `inspections` & `inspection_items`: Осмотры кузова и салона, топливо, пробег.
8. `media`: Метаданные фото/видео, координаты отметок дефектов (Damage Markers X/Y).
9. `work_orders` & `work_order_items`: Заказ-наряды, нормо-часы, запчасти, скидки, суммы.
10. `documents`: Акты приема-передачи, акты выполненных работ, счета.
11. `tasks` & `reminders`: Поручения цеха и сервисные напоминания по пробегу/дате.
12. `notifications`: In-app уведомления в реальном времени.
13. `audit_logs`: Неизменяемый журнал всех мутирующих операций.
14. `backups`: Резервные копии организации в формате `.aosbackup`.
15. `devices` & `sync_events`: Офлайн-синхронизация мобильных клиентов.
