import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { BackupType } from '@automotive-os/types';

@Injectable()
export class BackupsService {
  private backupDir: string;

  constructor(private readonly db: DatabaseService) {
    this.backupDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  getAll(orgId: string) {
    const rows = this.db.all<any>(
      `SELECT b.*, u.first_name, u.last_name, u.email as creator_email
       FROM backups b
       JOIN users u ON b.created_by = u.id
       WHERE b.organization_id = ?
       ORDER BY b.created_at DESC`,
      [orgId],
    );

    return rows.map((b) => ({
      ...b,
      creator: {
        id: b.created_by,
        first_name: b.first_name,
        last_name: b.last_name,
        email: b.creator_email,
      },
      download_url: `/api/v1/backups/${b.id}/download`,
    }));
  }

  getById(orgId: string, id: string) {
    const b = this.db.get<any>(
      `SELECT b.*, u.first_name, u.last_name, u.email as creator_email
       FROM backups b
       JOIN users u ON b.created_by = u.id
       WHERE b.id = ? AND b.organization_id = ?`,
      [id, orgId],
    );

    if (!b) {
      throw new NotFoundException({
        code: 'BACKUP_NOT_FOUND',
        message: 'Backup not found',
      });
    }

    return {
      ...b,
      creator: {
        id: b.created_by,
        first_name: b.first_name,
        last_name: b.last_name,
        email: b.creator_email,
      },
      download_url: `/api/v1/backups/${b.id}/download`,
    };
  }

  create(orgId: string, userId: string, type: BackupType = BackupType.MANUAL) {
    const backupId = uuidv4();
    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];
    const fileName = `automotive-backup-${orgId.slice(0, 8)}-${dateStr}.aosbackup`;
    const storageKey = `backups/${orgId}/${backupId}/${fileName}`;

    // Collect all organization tables data (Section 77-79)
    const org = this.db.get<any>('SELECT * FROM organizations WHERE id = ?', [orgId]);
    const locations = this.db.all<any>('SELECT * FROM locations WHERE organization_id = ?', [orgId]);
    const users = this.db.all<any>('SELECT * FROM users WHERE organization_id = ?', [orgId]);
    const customers = this.db.all<any>('SELECT * FROM customers WHERE organization_id = ?', [orgId]);
    const vehicles = this.db.all<any>('SELECT * FROM vehicles WHERE organization_id = ?', [orgId]);
    const inspections = this.db.all<any>('SELECT * FROM inspections WHERE organization_id = ?', [orgId]);
    const inspectionItems = this.db.all<any>(
      'SELECT ii.* FROM inspection_items ii JOIN inspections i ON ii.inspection_id = i.id WHERE i.organization_id = ?',
      [orgId],
    );
    const workOrders = this.db.all<any>('SELECT * FROM work_orders WHERE organization_id = ?', [orgId]);
    const workOrderItems = this.db.all<any>(
      'SELECT wi.* FROM work_order_items wi JOIN work_orders w ON wi.work_order_id = w.id WHERE w.organization_id = ?',
      [orgId],
    );
    const documents = this.db.all<any>('SELECT * FROM documents WHERE organization_id = ?', [orgId]);
    const media = this.db.all<any>('SELECT * FROM media WHERE organization_id = ?', [orgId]);
    const tasks = this.db.all<any>('SELECT * FROM tasks WHERE organization_id = ?', [orgId]);
    const reminders = this.db.all<any>('SELECT * FROM reminders WHERE organization_id = ?', [orgId]);

    const backupPackage = {
      manifest: {
        version: '1.0.0',
        system: 'AUTOMOTIVE OS',
        created_at: now,
        organization_id: orgId,
        organization_name: org?.name,
        type,
        entities: {
          locations: locations.length,
          users: users.length,
          customers: customers.length,
          vehicles: vehicles.length,
          inspections: inspections.length,
          inspection_items: inspectionItems.length,
          work_orders: workOrders.length,
          work_order_items: workOrderItems.length,
          documents: documents.length,
          media: media.length,
          tasks: tasks.length,
          reminders: reminders.length,
        },
      },
      data: {
        organization: org,
        locations,
        users,
        customers,
        vehicles,
        inspections,
        inspection_items: inspectionItems,
        work_orders: workOrders,
        work_order_items: workOrderItems,
        documents,
        media,
        tasks,
        reminders,
      },
    };

    const packageJson = JSON.stringify(backupPackage, null, 2);
    const checksum = crypto.createHash('sha256').update(packageJson).digest('hex');
    const size = Buffer.byteLength(packageJson);

    const filePath = path.join(this.backupDir, `${backupId}.aosbackup`);
    fs.writeFileSync(filePath, packageJson, 'utf-8');

    this.db.run(
      `INSERT INTO backups (id, organization_id, created_by, type, status, storage_key, size, checksum, started_at, completed_at, created_at)
       VALUES (?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?)`,
      [backupId, orgId, userId, type, storageKey, size, checksum, now, now, now],
    );

    return this.getById(orgId, backupId);
  }

  restore(orgId: string, backupId: string, confirmationToken: string) {
    if (confirmationToken !== 'RESTORE_CONFIRM') {
      throw new BadRequestException({
        code: 'CONFIRMATION_REQUIRED',
        message: 'Restore requires confirmationToken = "RESTORE_CONFIRM" to prevent accidental data loss',
      });
    }

    const backup = this.getById(orgId, backupId);
    const filePath = path.join(this.backupDir, `${backupId}.aosbackup`);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException({
        code: 'BACKUP_FILE_NOT_FOUND',
        message: 'Backup archive file is missing from storage',
      });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const checksum = crypto.createHash('sha256').update(content).digest('hex');

    if (backup.checksum && checksum !== backup.checksum) {
      throw new BadRequestException({
        code: 'CHECKSUM_MISMATCH',
        message: 'Backup archive checksum verification failed',
      });
    }

    const parsed = JSON.parse(content);
    const data = parsed.data || {};

    // Execute full transactional restore
    this.db.exec('PRAGMA foreign_keys = OFF');
    try {
      this.db.transaction(() => {
        // 1. Clean current organization tables (in foreign key safety order)
        this.db.run('DELETE FROM reminders WHERE organization_id = ?', [orgId]);
        this.db.run('DELETE FROM tasks WHERE organization_id = ?', [orgId]);
        this.db.run('DELETE FROM documents WHERE organization_id = ?', [orgId]);
        this.db.run('DELETE FROM media WHERE organization_id = ?', [orgId]);
        this.db.run(
          'DELETE FROM work_order_items WHERE work_order_id IN (SELECT id FROM work_orders WHERE organization_id = ?)',
          [orgId],
        );
        this.db.run('DELETE FROM work_orders WHERE organization_id = ?', [orgId]);
        this.db.run(
          'DELETE FROM inspection_items WHERE inspection_id IN (SELECT id FROM inspections WHERE organization_id = ?)',
          [orgId],
        );
        this.db.run('DELETE FROM inspections WHERE organization_id = ?', [orgId]);
        this.db.run('DELETE FROM vehicles WHERE organization_id = ?', [orgId]);
        this.db.run('DELETE FROM customers WHERE organization_id = ?', [orgId]);

        // 2. Insert helper
        const insertRows = (tableName: string, rows: any[]) => {
          if (!Array.isArray(rows) || rows.length === 0) return;
          for (const row of rows) {
            const keys = Object.keys(row);
            const placeholders = keys.map(() => '?').join(', ');
            const values = keys.map((k) => row[k]);
            const sql = `INSERT OR REPLACE INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
            this.db.run(sql, values);
          }
        };

        if (data.organization) {
          insertRows('organizations', [data.organization]);
        }
        insertRows('locations', data.locations);
        insertRows('users', data.users);
        insertRows('customers', data.customers);
        insertRows('vehicles', data.vehicles);
        insertRows('inspections', data.inspections);
        insertRows('inspection_items', data.inspection_items);
        insertRows('work_orders', data.work_orders);
        insertRows('work_order_items', data.work_order_items);
        insertRows('documents', data.documents);
        insertRows('media', data.media);
        insertRows('tasks', data.tasks);
        insertRows('reminders', data.reminders);
      });
    } finally {
      this.db.exec('PRAGMA foreign_keys = ON');
    }

    return {
      success: true,
      message: `Organization restored successfully from backup ${backupId}`,
      manifest: parsed.manifest,
    };
  }
}
