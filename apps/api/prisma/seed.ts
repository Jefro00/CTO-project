import { DatabaseService } from '../src/database/database.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { SystemRole, InspectionStatus, InspectionItemStatus, WorkOrderStatus, WorkOrderItemType, DocumentType, TaskPriority, TaskStatus, ReminderType, ReminderStatus } from '@automotive-os/types';
import { ROLE_PERMISSIONS, PERMISSIONS } from '@automotive-os/permissions';

async function seed() {
  console.log('🌱 Seeding Automotive OS database (Section 90 of Specification)...');
  const dbService = new DatabaseService();
  dbService.onModuleInit();
  const db = dbService.db;

  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync('Password123!', 10);

  // Clear existing data for fresh seed
  db.exec(`
    DELETE FROM sync_events;
    DELETE FROM devices;
    DELETE FROM backups;
    DELETE FROM audit_logs;
    DELETE FROM notifications;
    DELETE FROM reminders;
    DELETE FROM tasks;
    DELETE FROM documents;
    DELETE FROM document_templates;
    DELETE FROM work_order_items;
    DELETE FROM work_orders;
    DELETE FROM media;
    DELETE FROM inspection_items;
    DELETE FROM inspections;
    DELETE FROM vehicles;
    DELETE FROM customers;
    DELETE FROM role_permissions;
    DELETE FROM permissions;
    DELETE FROM users;
    DELETE FROM roles;
    DELETE FROM locations;
    DELETE FROM organizations;
  `);

  // 1. Organization: JEFRO AUTO
  const orgId = uuidv4();
  dbService.run(
    `INSERT INTO organizations (id, name, legal_name, tax_id, phone, email, address, timezone, currency, status, created_at, updated_at)
     VALUES (?, 'JEFRO AUTO', 'ООО "ДЖЕФРО АВТО СЕРВИС"', '7701987654', '+7 (495) 777-00-11', 'info@jefroauto.local', 'г. Москва, ул. Автозаводская, д. 23', 'UTC+3', 'RUB', 'active', ?, ?)`,
    [orgId, now, now],
  );

  // 2. Locations: СТО №1, СТО №2
  const loc1Id = uuidv4();
  const loc2Id = uuidv4();
  dbService.run(
    `INSERT INTO locations (id, organization_id, name, city, address, phone, email, timezone, status, created_at, updated_at)
     VALUES (?, ?, 'СТО №1 (Центр)', 'Москва', 'ул. Автозаводская, д. 23, стр. 1', '+7 (495) 777-00-11', 'sto1@jefroauto.local', 'UTC+3', 'active', ?, ?)`,
    [loc1Id, orgId, now, now],
  );
  dbService.run(
    `INSERT INTO locations (id, organization_id, name, city, address, phone, email, timezone, status, created_at, updated_at)
     VALUES (?, ?, 'СТО №2 (Север)', 'Москва', 'Дмитровское шоссе, д. 110', '+7 (495) 777-00-22', 'sto2@jefroauto.local', 'UTC+3', 'active', ?, ?)`,
    [loc2Id, orgId, now, now],
  );

  // 3. Permissions
  const permMap: Record<string, string> = {};
  for (const [key, code] of Object.entries(PERMISSIONS)) {
    const pId = uuidv4();
    dbService.run('INSERT INTO permissions (id, code, description) VALUES (?, ?, ?)', [
      pId,
      code,
      `Permission for ${code}`,
    ]);
    permMap[code] = pId;
  }

  // 4. System Roles
  const systemRoles = Object.values(SystemRole);
  const roleMap: Record<string, string> = {};

  for (const rName of systemRoles) {
    const roleId = uuidv4();
    dbService.run(
      `INSERT INTO roles (id, organization_id, name, description, is_system, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [roleId, orgId, rName, `System role: ${rName}`, now, now],
    );
    roleMap[rName] = roleId;

    const allowed = ROLE_PERMISSIONS[rName as SystemRole] || [];
    if (allowed.includes('*')) {
      for (const pId of Object.values(permMap)) {
        dbService.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [roleId, pId]);
      }
    } else {
      for (const code of allowed) {
        if (permMap[code]) {
          dbService.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [roleId, permMap[code]]);
        }
      }
    }
  }

  // 5. Users
  const userOwnerId = uuidv4();
  const userManagerId = uuidv4();
  const userAdvisorId = uuidv4();
  const userMechanicId = uuidv4();
  const userDocMgrId = uuidv4();
  const userViewerId = uuidv4();

  const users = [
    { id: userOwnerId, email: 'owner@example.local', firstName: 'Александр', lastName: 'Волков', role: SystemRole.OWNER, locId: null },
    { id: userManagerId, email: 'manager@example.local', firstName: 'Дмитрий', lastName: 'Соколов', role: SystemRole.BRANCH_MANAGER, locId: loc1Id },
    { id: userAdvisorId, email: 'advisor@example.local', firstName: 'Михаил', lastName: 'Мастеров', role: SystemRole.SERVICE_ADVISOR, locId: loc1Id },
    { id: userMechanicId, email: 'mechanic@example.local', firstName: 'Алексей', lastName: 'Ключевский', role: SystemRole.MECHANIC, locId: loc1Id },
    { id: userDocMgrId, email: 'documents@example.local', firstName: 'Елена', lastName: 'Документова', role: SystemRole.DOCUMENT_MANAGER, locId: loc1Id },
    { id: userViewerId, email: 'viewer@example.local', firstName: 'Ольга', lastName: 'Наблюдатель', role: SystemRole.VIEWER, locId: loc1Id },
  ];

  for (const u of users) {
    dbService.run(
      `INSERT INTO users (id, organization_id, location_id, role_id, first_name, last_name, email, password_hash, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [u.id, orgId, u.locId, roleMap[u.role], u.firstName, u.lastName, u.email, passwordHash, now, now],
    );
  }

  // 6. Customers
  const cust1Id = uuidv4();
  const cust2Id = uuidv4();
  const cust3Id = uuidv4();

  dbService.run(
    `INSERT INTO customers (id, organization_id, first_name, last_name, phone, email, address, notes, status, created_at, updated_at)
     VALUES (?, ?, 'Иван', 'Петров', '+7 (999) 111-22-33', 'ivan.petrov@example.local', 'Москва, Ленинский пр-т, д. 45, кв. 12', 'Постоянный клиент, премиальное обслуживание', 'active', ?, ?)`,
    [cust1Id, orgId, now, now],
  );
  dbService.run(
    `INSERT INTO customers (id, organization_id, first_name, last_name, phone, email, address, notes, status, created_at, updated_at)
     VALUES (?, ?, 'Сергей', 'Смирнов', '+7 (999) 222-33-44', 'sergey.smirnov@example.local', 'Москва, ул. Тверская, д. 14', 'Корпоративный клиент', 'active', ?, ?)`,
    [cust2Id, orgId, now, now],
  );
  dbService.run(
    `INSERT INTO customers (id, organization_id, first_name, last_name, phone, email, address, notes, status, created_at, updated_at)
     VALUES (?, ?, 'Анна', 'Кузнецова', '+7 (999) 333-44-55', 'anna.k@example.local', 'Москва, Кутузовский пр-т, д. 8', 'Звонить после 14:00', 'active', ?, ?)`,
    [cust3Id, orgId, now, now],
  );

  // 7. Vehicles
  const veh1Id = uuidv4();
  const veh2Id = uuidv4();
  const veh3Id = uuidv4();

  dbService.run(
    `INSERT INTO vehicles (
      id, organization_id, customer_id, vin, license_plate, make, model, generation, year,
      color, body_type, engine, engine_volume, transmission, drive_type, fuel_type, mileage, mileage_unit, notes, status, created_at, updated_at
    ) VALUES (?, ?, ?, 'WBAJB31090G123456', 'A123AA77', 'BMW', 'X5', 'G05', 2021, 'Черный сапфир', 'Кроссовер', 'B58 3.0', '3.0 л', 'АКПП 8-ст', 'Полный (xDrive)', 'Бензин', 142300, 'km', 'Обслуживание строго по регламенту BMW', 'in_service', ?, ?)`,
    [veh1Id, orgId, cust1Id, now, now],
  );

  dbService.run(
    `INSERT INTO vehicles (
      id, organization_id, customer_id, vin, license_plate, make, model, generation, year,
      color, body_type, engine, engine_volume, transmission, drive_type, fuel_type, mileage, mileage_unit, notes, status, created_at, updated_at
    ) VALUES (?, ?, ?, 'JTDKN3DU5A0789012', 'B777BB777', 'Toyota', 'Camry', 'XV70', 2022, 'Белый перламутр', 'Седан', '2.5 Dynamic Force', '2.5 л', 'АКПП 8-ст', 'Передний', 'Бензин', 65400, 'km', 'Установлена сигнализация с автозапуском', 'active', ?, ?)`,
    [veh2Id, orgId, cust2Id, now, now],
  );

  dbService.run(
    `INSERT INTO vehicles (
      id, organization_id, customer_id, vin, license_plate, make, model, generation, year,
      color, body_type, engine, engine_volume, transmission, drive_type, fuel_type, mileage, mileage_unit, notes, status, created_at, updated_at
    ) VALUES (?, ?, ?, 'WDB2130421A456789', 'C999CC77', 'Mercedes-Benz', 'E-Class', 'W213', 2020, 'Серый селенит', 'Седан', '2.0 Turbo', '2.0 л', '9G-Tronic', 'Полный (4MATIC)', 'Бензин', 98200, 'km', 'AMG line пакет', 'active', ?, ?)`,
    [veh3Id, orgId, cust3Id, now, now],
  );

  // 8. Inspections & Checklist
  const insp1Id = uuidv4();
  dbService.run(
    `INSERT INTO inspections (
      id, organization_id, location_id, vehicle_id, customer_id, created_by,
      mileage, fuel_level, status, customer_comment, internal_comment, started_at, completed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 142300, 75, 'completed', 'Плановое ТО и легкий скрип при торможении', 'Передний бампер имеет небольшой скол лака справа', ?, ?, ?, ?)`,
    [insp1Id, orgId, loc1Id, veh1Id, cust1Id, userAdvisorId, now, now, now, now],
  );

  const checklistItems = [
    { cat: 'body', name: 'Передний бампер и оптика', status: 'damage', comment: 'Скол лака на правом крае бампера ~2см' },
    { cat: 'body', name: 'Левая сторона (крылья, двери)', status: 'ok', comment: 'Без дефектов' },
    { cat: 'body', name: 'Правая сторона (крылья, двери)', status: 'ok', comment: 'Без дефектов' },
    { cat: 'body', name: 'Задняя часть и багажник', status: 'ok', comment: 'Без дефектов' },
    { cat: 'body', name: 'Крыша и панорамное остекление', status: 'ok', comment: 'Чисто' },
    { cat: 'interior', name: 'Передние сиденья и ремни', status: 'ok', comment: 'Салон чистый' },
    { cat: 'interior', name: 'Задний ряд сидений', status: 'ok', comment: 'Норма' },
    { cat: 'interior', name: 'Приборная панель и мультимедиа', status: 'warning', comment: 'Горит индикатор приближения сервисного интервала' },
  ];

  for (let idx = 0; idx < checklistItems.length; idx++) {
    const ci = checklistItems[idx];
    dbService.run(
      `INSERT INTO inspection_items (id, inspection_id, category, name, status, comment, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), insp1Id, ci.cat, ci.name, ci.status, ci.comment, idx + 1, now, now],
    );
  }

  // 9. Media with Damage Marker (Section 67)
  const media1Id = uuidv4();
  const damageMarkers = [
    { x: 78.5, y: 42.0, severity: 'moderate', comment: 'Скол ЛКП на бампере справа' },
  ];

  dbService.run(
    `INSERT INTO media (
      id, organization_id, location_id, vehicle_id, customer_id, inspection_id, uploaded_by,
      type, storage_key, mime_type, file_name, file_size, checksum, status, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'photo', ?, 'image/jpeg', 'bmw_x5_front_inspection.jpg', 2450000, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'ready', ?, ?)`,
    [
      media1Id,
      orgId,
      loc1Id,
      veh1Id,
      cust1Id,
      insp1Id,
      userAdvisorId,
      `organizations/${orgId}/inspections/${insp1Id}/photos/${media1Id}.jpg`,
      JSON.stringify({ damage_markers: damageMarkers, width: 1920, height: 1080 }),
      now,
    ],
  );

  const media2Id = uuidv4();
  dbService.run(
    `INSERT INTO media (
      id, organization_id, location_id, vehicle_id, customer_id, inspection_id, uploaded_by,
      type, storage_key, mime_type, file_name, file_size, duration, checksum, status, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'video', ?, 'video/mp4', 'bmw_x5_walkaround_inspection.mp4', 18450000, 35, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', 'ready', null, ?)`,
    [
      media2Id,
      orgId,
      loc1Id,
      veh1Id,
      cust1Id,
      insp1Id,
      userAdvisorId,
      `organizations/${orgId}/inspections/${insp1Id}/videos/${media2Id}.mp4`,
      now,
    ],
  );

  // 10. Work Order #1824 (Section 68)
  const wo1Id = uuidv4();
  dbService.run(
    `INSERT INTO work_orders (
      id, organization_id, location_id, vehicle_id, customer_id, inspection_id,
      advisor_id, master_id, number, status, customer_complaint, diagnosis,
      mileage_in, subtotal, discount, tax, total, opened_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '1824', 'in_progress', 'Плановое ТО (масло, фильтры) + диагностика тормозной системы', 'Требуется замена масла ДВС и масляного фильтра, износ передних колодок 40%', 142300, 9600, 0, 0, 9600, ?, ?, ?)`,
    [wo1Id, orgId, loc1Id, veh1Id, cust1Id, insp1Id, userAdvisorId, userMechanicId, now, now, now],
  );

  const wo1Items = [
    { type: WorkOrderItemType.LABOR, desc: 'Замена моторного масла и фильтра', q: 1, p: 4800, cost: 2000, status: 'in_progress' },
    { type: WorkOrderItemType.LABOR, desc: 'Компьютерная диагностика электронных систем', q: 1, p: 2500, cost: 1000, status: 'completed' },
    { type: WorkOrderItemType.LABOR, desc: 'Замена воздушного и салонного фильтров', q: 1, p: 1500, cost: 600, status: 'pending' },
    { type: WorkOrderItemType.PART, desc: 'Фильтр масляный оригинальный BMW', q: 1, p: 800, cost: 450, status: 'completed' },
  ];

  for (const it of wo1Items) {
    dbService.run(
      `INSERT INTO work_order_items (id, work_order_id, type, description, quantity, unit_price, cost_price, total_price, assigned_to, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), wo1Id, it.type, it.desc, it.q, it.p, it.cost, it.q * it.p, userMechanicId, it.status, now, now],
    );
  }

  // Work Order #1825 for Toyota Camry
  const wo2Id = uuidv4();
  dbService.run(
    `INSERT INTO work_orders (
      id, organization_id, location_id, vehicle_id, customer_id, inspection_id,
      advisor_id, master_id, number, status, customer_complaint, diagnosis,
      mileage_in, subtotal, discount, tax, total, opened_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, null, ?, null, '1825', 'waiting_approval', 'Стук в подвеске на неровностях', 'Люфт стойки стабилизатора передней правой', 65400, 5200, 200, 0, 5000, ?, ?, ?)`,
    [wo2Id, orgId, loc1Id, veh2Id, cust2Id, userAdvisorId, now, now, now],
  );

  dbService.run(
    `INSERT INTO work_order_items (id, work_order_id, type, description, quantity, unit_price, cost_price, total_price, assigned_to, status, created_at, updated_at)
     VALUES (?, ?, 'labor', 'Замена стойки стабилизатора', 1, 2200, 800, 2200, null, 'pending', ?, ?)`,
    [uuidv4(), wo2Id, now, now],
  );
  dbService.run(
    `INSERT INTO work_order_items (id, work_order_id, type, description, quantity, unit_price, cost_price, total_price, assigned_to, status, created_at, updated_at)
     VALUES (?, ?, 'part', 'Стойка стабилизатора передняя правая Toyota OEM', 1, 3000, 1900, 3000, null, 'pending', ?, ?)`,
    [uuidv4(), wo2Id, now, now],
  );

  // Work Order #1823 for Mercedes-Benz (Closed)
  const wo3Id = uuidv4();
  dbService.run(
    `INSERT INTO work_orders (
      id, organization_id, location_id, vehicle_id, customer_id, inspection_id,
      advisor_id, master_id, number, status, customer_complaint, diagnosis,
      mileage_in, mileage_out, subtotal, discount, tax, total, opened_at, completed_at, closed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, null, ?, ?, '1823', 'closed', 'Замена передних тормозных дисков и колодок', 'Критический износ тормозных дисков', 97500, 98200, 15400, 0, 0, 15400, ?, ?, ?, ?, ?)`,
    [wo3Id, orgId, loc1Id, veh3Id, cust3Id, userAdvisorId, userMechanicId, now, now, now, now, now],
  );

  // 11. Documents
  const doc1Id = uuidv4();
  dbService.run(
    `INSERT INTO documents (
      id, organization_id, location_id, customer_id, vehicle_id, work_order_id,
      uploaded_by, type, name, storage_key, mime_type, file_size, checksum, is_signed, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'work_order', 'Заказ-наряд #1824.pdf', 'docs/1824.pdf', 'application/pdf', 104200, 'abc123checksum', 1, ?, ?)`,
    [doc1Id, orgId, loc1Id, cust1Id, veh1Id, wo1Id, userAdvisorId, now, now],
  );

  const doc2Id = uuidv4();
  dbService.run(
    `INSERT INTO documents (
      id, organization_id, location_id, customer_id, vehicle_id, work_order_id,
      uploaded_by, type, name, storage_key, mime_type, file_size, checksum, is_signed, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'acceptance_act', 'Акт приема-передачи ТС к заказу #1824.pdf', 'docs/act-1824.pdf', 'application/pdf', 95300, 'def456checksum', 1, ?, ?)`,
    [doc2Id, orgId, loc1Id, cust1Id, veh1Id, wo1Id, userAdvisorId, now, now],
  );

  const doc3Id = uuidv4();
  dbService.run(
    `INSERT INTO documents (
      id, organization_id, location_id, customer_id, vehicle_id, work_order_id,
      uploaded_by, type, name, storage_key, mime_type, file_size, checksum, is_signed, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completion_act', 'Акт выполненных работ к заказу #1823.pdf', 'docs/act-1823.pdf', 'application/pdf', 112000, 'ghi789checksum', 1, ?, ?)`,
    [doc3Id, orgId, loc1Id, cust3Id, veh3Id, wo3Id, userAdvisorId, now, now],
  );

  // 12. Tasks
  const task1Id = uuidv4();
  dbService.run(
    `INSERT INTO tasks (
      id, organization_id, location_id, vehicle_id, customer_id, work_order_id,
      assigned_to, created_by, title, description, priority, status, due_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Выполнить замену масла BMW X5', 'Залить 6.5л синтетики 5W-30 BMW Longlife-04', 'high', 'in_progress', ?, ?, ?)`,
    [task1Id, orgId, loc1Id, veh1Id, cust1Id, wo1Id, userMechanicId, userAdvisorId, now, now, now],
  );

  const task2Id = uuidv4();
  const pastDue = new Date(Date.now() - 3600 * 1000 * 24).toISOString();
  dbService.run(
    `INSERT INTO tasks (
      id, organization_id, location_id, vehicle_id, customer_id, work_order_id,
      assigned_to, created_by, title, description, priority, status, due_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Позвонить клиенту Toyota Camry', 'Согласовать замену стойки стабилизатора', 'normal', 'new', ?, ?, ?)`,
    [task2Id, orgId, loc1Id, veh2Id, cust2Id, wo2Id, userAdvisorId, userManagerId, pastDue, now, now],
  );

  // 13. Reminders
  dbService.run(
    `INSERT INTO reminders (
      id, organization_id, location_id, vehicle_id, customer_id, created_by,
      type, title, description, target_mileage, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'mileage', 'Следующее ТО (152 300 км)', 'Замена масла ДВС, свечей и тормозной жидкости', 152300, 'active', ?, ?)`,
    [uuidv4(), orgId, loc1Id, veh1Id, cust1Id, userAdvisorId, now, now],
  );

  dbService.run(
    `INSERT INTO reminders (
      id, organization_id, location_id, vehicle_id, customer_id, created_by,
      type, title, description, target_date, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'date', 'Сезонная замена шин и сход-развал', 'Подготовка к зимнему сезону', '2026-10-20T09:00:00.000Z', 'active', ?, ?)`,
    [uuidv4(), orgId, loc1Id, veh2Id, cust2Id, userAdvisorId, now, now],
  );

  // 14. Notifications
  dbService.run(
    `INSERT INTO notifications (id, organization_id, user_id, type, title, body, entity_type, entity_id, is_read, created_at)
     VALUES (?, ?, ?, 'work_order.assigned', 'Назначен новый заказ-наряд #1824', 'Автомобиль BMW X5 (A123AA77) передан в работу', 'work_order', ?, 0, ?)`,
    [uuidv4(), orgId, userMechanicId, wo1Id, now],
  );

  // 15. Audit Logs
  dbService.run(
    `INSERT INTO audit_logs (id, organization_id, location_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at)
     VALUES (?, ?, ?, ?, 'create', 'work_orders', ?, null, '{"number":"1824","vehicle":"BMW X5"}', '127.0.0.1', 'SeedScript/1.0', ?)`,
    [uuidv4(), orgId, loc1Id, userAdvisorId, wo1Id, now],
  );

  console.log('✅ Seeding completed successfully!');
  console.log('--- TEST ACCOUNTS (Password: Password123!) ---');
  console.log('👑 Owner: owner@example.local');
  console.log('🏢 Branch Manager: manager@example.local');
  console.log('📋 Service Advisor: advisor@example.local');
  console.log('🔧 Mechanic: mechanic@example.local');
  console.log('📄 Document Manager: documents@example.local');
  console.log('👁️ Viewer: viewer@example.local');
  console.log('---------------------------------------------');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
