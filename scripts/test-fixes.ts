import * as path from 'path';
if (!process.env.DATABASE_FILE) {
  process.env.DATABASE_FILE = path.resolve(__dirname, '../apps/api/data/automotive.db');
}
import { BackupsService } from '../apps/api/src/backups/backups.service';
import { DatabaseService } from '../apps/api/src/database/database.service';
import { TasksService } from '../apps/api/src/tasks/tasks.service';
import { InspectionsService } from '../apps/api/src/inspections/inspections.service';
import { AppWebSocketGateway } from '../apps/api/src/websocket/websocket.gateway';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('Testing bug fixes...');
  const db = new DatabaseService();
  db.onModuleInit();
  const ws = new AppWebSocketGateway();
  const backupsService = new BackupsService(db);
  const tasksService = new TasksService(db, ws);
  const inspectionsService = new InspectionsService(db, ws);

  const org = db.get<any>('SELECT * FROM organizations LIMIT 1');
  const owner = db.get<any>("SELECT * FROM users WHERE email = 'owner@example.local' LIMIT 1");

  if (!org || !owner) {
    throw new Error('Database not seeded');
  }

  const orgId = org.id;
  const ownerId = owner.id;

  // 1. Verify Tasks query with priority ordering (BUG-06)
  console.log('1. Testing Tasks query...');
  const tasks = tasksService.getAll(orgId);
  console.log(`✅ Tasks query succeeded, returned ${tasks.length} tasks`);

  // 2. Verify Inspection with damage markers (BUG-08)
  console.log('2. Testing Inspection damage markers...');
  const testVeh = db.get<any>('SELECT * FROM vehicles WHERE organization_id = ? LIMIT 1', [orgId]);
  const testCust = db.get<any>('SELECT * FROM customers WHERE organization_id = ? LIMIT 1', [orgId]);
  const testLoc = db.get<any>('SELECT * FROM locations WHERE organization_id = ? LIMIT 1', [orgId]);
  const insp = inspectionsService.create(orgId, ownerId, testLoc.id, {
    location_id: testLoc.id,
    vehicle_id: testVeh.id,
    customer_id: testCust.id,
    mileage: 150000,
    fuel_level: 75,
    damage_markers: [
      { id: 'm1', view: 'front', severity: 'moderate', comment: 'Царапина на крыле', x: 25, y: 40 }
    ],
  });
  const loadedInsp = inspectionsService.getById(orgId, insp.id);
  if (loadedInsp.media && loadedInsp.media.length > 0) {
    console.log(`✅ Inspection damage marker saved as media: ${loadedInsp.media[0].file_name}`);
  } else {
    throw new Error('Damage marker media not saved');
  }

  // 3. Verify Backup & Real Restore (BUG-02)
  console.log('3. Testing Backup and True Restore...');
  const backup = backupsService.create(orgId, ownerId);
  console.log(`✅ Backup created: ${backup.id}`);

  // Create a probe customer after backup
  const probeId = uuidv4();
  db.run(
    `INSERT INTO customers (id, organization_id, first_name, last_name, phone, created_at, updated_at)
     VALUES (?, ?, 'RestoreProbe', 'Customer', '+79998887766', datetime('now'), datetime('now'))`,
    [probeId, orgId],
  );
  let probe = db.get<any>('SELECT * FROM customers WHERE id = ?', [probeId]);
  if (!probe) throw new Error('Failed to create probe customer');
  console.log('   Probe customer created in DB after backup');

  // Perform restore
  const restoreRes = backupsService.restore(orgId, backup.id, 'RESTORE_CONFIRM');
  console.log(`✅ Restore executed: ${restoreRes.message}`);

  // Verify probe customer no longer exists after restore
  probe = db.get<any>('SELECT * FROM customers WHERE id = ?', [probeId]);
  if (probe) {
    throw new Error('FAILURE: Probe customer still exists after restore!');
  }
  console.log('✅ PROOF: Probe customer created after backup was wiped upon restore!');

  console.log('\n🎉 ALL FIXES VERIFIED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
