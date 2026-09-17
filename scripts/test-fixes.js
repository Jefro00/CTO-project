"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backups_service_1 = require("../apps/api/src/backups/backups.service");
const database_service_1 = require("../apps/api/src/database/database.service");
const tasks_service_1 = require("../apps/api/src/tasks/tasks.service");
const inspections_service_1 = require("../apps/api/src/inspections/inspections.service");
const websocket_gateway_1 = require("../apps/api/src/websocket/websocket.gateway");
const uuid_1 = require("uuid");
async function main() {
    console.log('Testing bug fixes...');
    const db = new database_service_1.DatabaseService();
    db.onModuleInit();
    const ws = new websocket_gateway_1.AppWebSocketGateway();
    const backupsService = new backups_service_1.BackupsService(db);
    const tasksService = new tasks_service_1.TasksService(db, ws);
    const inspectionsService = new inspections_service_1.InspectionsService(db, ws);
    const org = db.get('SELECT * FROM organizations LIMIT 1');
    const owner = db.get("SELECT * FROM users WHERE email = 'owner@example.local' LIMIT 1");
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
    const testVeh = db.get('SELECT * FROM vehicles WHERE organization_id = ? LIMIT 1', [orgId]);
    const testCust = db.get('SELECT * FROM customers WHERE organization_id = ? LIMIT 1', [orgId]);
    const testLoc = db.get('SELECT * FROM locations WHERE organization_id = ? LIMIT 1', [orgId]);
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
    }
    else {
        throw new Error('Damage marker media not saved');
    }
    // 3. Verify Backup & Real Restore (BUG-02)
    console.log('3. Testing Backup and True Restore...');
    const backup = backupsService.create(orgId, ownerId);
    console.log(`✅ Backup created: ${backup.id}`);
    // Create a probe customer after backup
    const probeId = (0, uuid_1.v4)();
    db.run(`INSERT INTO customers (id, organization_id, first_name, last_name, phone, created_at, updated_at)
     VALUES (?, ?, 'RestoreProbe', 'Customer', '+79998887766', datetime('now'), datetime('now'))`, [probeId, orgId]);
    let probe = db.get('SELECT * FROM customers WHERE id = ?', [probeId]);
    if (!probe)
        throw new Error('Failed to create probe customer');
    console.log('   Probe customer created in DB after backup');
    // Perform restore
    const restoreRes = backupsService.restore(orgId, backup.id, 'RESTORE_CONFIRM');
    console.log(`✅ Restore executed: ${restoreRes.message}`);
    // Verify probe customer no longer exists after restore
    probe = db.get('SELECT * FROM customers WHERE id = ?', [probeId]);
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
//# sourceMappingURL=test-fixes.js.map