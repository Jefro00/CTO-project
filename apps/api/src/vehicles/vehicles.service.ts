import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';
import { VehicleHistoryItem } from '@automotive-os/types';

@Injectable()
export class VehiclesService {
  constructor(private readonly db: DatabaseService) {}

  getAll(
    orgId: string,
    query?: {
      page?: number;
      limit?: number;
      make?: string;
      model?: string;
      year?: number;
      license_plate?: string;
      vin?: string;
      status?: string;
      search?: string;
    },
  ) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
    const offset = (page - 1) * limit;

    let sql = `
      SELECT v.*, c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone, c.email as customer_email
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      WHERE v.organization_id = ? AND v.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (query?.make) {
      sql += ' AND LOWER(v.make) = LOWER(?)';
      params.push(query.make);
    }
    if (query?.model) {
      sql += ' AND LOWER(v.model) LIKE LOWER(?)';
      params.push(`%${query.model}%`);
    }
    if (query?.year) {
      sql += ' AND v.year = ?';
      params.push(Number(query.year));
    }
    if (query?.license_plate) {
      sql += ' AND LOWER(v.license_plate) LIKE LOWER(?)';
      params.push(`%${query.license_plate}%`);
    }
    if (query?.vin) {
      sql += ' AND LOWER(v.vin) LIKE LOWER(?)';
      params.push(`%${query.vin}%`);
    }
    if (query?.status) {
      sql += ' AND v.status = ?';
      params.push(query.status);
    }
    if (query?.search) {
      sql += ` AND (
        LOWER(v.vin) LIKE LOWER(?) OR
        LOWER(v.license_plate) LIKE LOWER(?) OR
        LOWER(v.make) LIKE LOWER(?) OR
        LOWER(v.model) LIKE LOWER(?) OR
        LOWER(c.first_name) LIKE LOWER(?) OR
        LOWER(c.last_name) LIKE LOWER(?) OR
        c.phone LIKE ?
      )`;
      const s = `%${query.search.trim()}%`;
      params.push(s, s, s, s, s, s, s);
    }

    const countRow = this.db.get<any>(`SELECT COUNT(*) as total FROM (${sql})`, params);
    const total = countRow?.total || 0;

    sql += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = this.db.all<any>(sql, params);

    const data = rows.map((v) => ({
      ...v,
      customer: {
        id: v.customer_id,
        first_name: v.customer_first_name,
        last_name: v.customer_last_name,
        phone: v.customer_phone,
        email: v.customer_email,
      },
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  search(orgId: string, q: string) {
    const s = `%${q.trim()}%`;
    const rows = this.db.all<any>(
      `SELECT v.*, c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone
       FROM vehicles v
       JOIN customers c ON v.customer_id = c.id
       WHERE v.organization_id = ? AND v.deleted_at IS NULL
         AND (
           LOWER(v.vin) LIKE LOWER(?) OR
           LOWER(v.license_plate) LIKE LOWER(?) OR
           LOWER(v.make) LIKE LOWER(?) OR
           LOWER(v.model) LIKE LOWER(?) OR
           c.phone LIKE ? OR
           LOWER(c.first_name) LIKE LOWER(?) OR
           LOWER(c.last_name) LIKE LOWER(?)
         )
       ORDER BY v.created_at DESC LIMIT 20`,
      [orgId, s, s, s, s, s, s, s],
    );

    return rows.map((v) => ({
      ...v,
      customer: {
        id: v.customer_id,
        first_name: v.customer_first_name,
        last_name: v.customer_last_name,
        phone: v.customer_phone,
      },
    }));
  }

  getById(orgId: string, id: string) {
    const v = this.db.get<any>(
      `SELECT v.*, c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone, c.email as customer_email, c.address as customer_address
       FROM vehicles v
       JOIN customers c ON v.customer_id = c.id
       WHERE v.id = ? AND v.organization_id = ? AND v.deleted_at IS NULL`,
      [id, orgId],
    );

    if (!v) {
      throw new NotFoundException({
        code: 'VEHICLE_NOT_FOUND',
        message: 'Vehicle not found',
      });
    }

    return {
      ...v,
      customer: {
        id: v.customer_id,
        first_name: v.customer_first_name,
        last_name: v.customer_last_name,
        phone: v.customer_phone,
        email: v.customer_email,
        address: v.customer_address,
      },
    };
  }

  create(orgId: string, data: any) {
    // Check VIN uniqueness in organization (Section 15)
    const existing = this.db.get<any>(
      'SELECT id FROM vehicles WHERE organization_id = ? AND vin = ? AND deleted_at IS NULL',
      [orgId, data.vin.trim().toUpperCase()],
    );

    if (existing) {
      throw new ConflictException({
        code: 'VIN_ALREADY_EXISTS',
        message: 'A vehicle with this VIN already exists in the organization',
      });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO vehicles (
        id, organization_id, customer_id, vin, license_plate, make, model, generation, year,
        color, body_type, engine, engine_volume, transmission, drive_type, fuel_type,
        mileage, mileage_unit, notes, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        orgId,
        data.customer_id,
        data.vin.trim().toUpperCase(),
        data.license_plate.trim().toUpperCase(),
        data.make.trim(),
        data.model.trim(),
        data.generation || null,
        Number(data.year) || new Date().getFullYear(),
        data.color || null,
        data.body_type || null,
        data.engine || null,
        data.engine_volume || null,
        data.transmission || null,
        data.drive_type || null,
        data.fuel_type || null,
        Number(data.mileage) || 0,
        data.mileage_unit || 'km',
        data.notes || null,
        data.status || 'active',
        now,
        now,
      ],
    );

    return this.getById(orgId, id);
  }

  update(orgId: string, id: string, data: any) {
    const v = this.getById(orgId, id);
    const now = new Date().toISOString();

    if (data.vin && data.vin.trim().toUpperCase() !== v.vin) {
      const existing = this.db.get<any>(
        'SELECT id FROM vehicles WHERE organization_id = ? AND vin = ? AND id != ? AND deleted_at IS NULL',
        [orgId, data.vin.trim().toUpperCase(), id],
      );
      if (existing) {
        throw new ConflictException({
          code: 'VIN_ALREADY_EXISTS',
          message: 'A vehicle with this VIN already exists in the organization',
        });
      }
    }

    this.db.run(
      `UPDATE vehicles SET
        customer_id = ?,
        vin = ?,
        license_plate = ?,
        make = ?,
        model = ?,
        generation = ?,
        year = ?,
        color = ?,
        body_type = ?,
        engine = ?,
        engine_volume = ?,
        transmission = ?,
        drive_type = ?,
        fuel_type = ?,
        mileage = ?,
        mileage_unit = ?,
        notes = ?,
        status = ?,
        updated_at = ?
      WHERE id = ? AND organization_id = ?`,
      [
        data.customer_id ?? v.customer_id,
        data.vin ? data.vin.trim().toUpperCase() : v.vin,
        data.license_plate ? data.license_plate.trim().toUpperCase() : v.license_plate,
        data.make ?? v.make,
        data.model ?? v.model,
        data.generation !== undefined ? data.generation : v.generation,
        data.year !== undefined ? Number(data.year) : v.year,
        data.color !== undefined ? data.color : v.color,
        data.body_type !== undefined ? data.body_type : v.body_type,
        data.engine !== undefined ? data.engine : v.engine,
        data.engine_volume !== undefined ? data.engine_volume : v.engine_volume,
        data.transmission !== undefined ? data.transmission : v.transmission,
        data.drive_type !== undefined ? data.drive_type : v.drive_type,
        data.fuel_type !== undefined ? data.fuel_type : v.fuel_type,
        data.mileage !== undefined ? Number(data.mileage) : v.mileage,
        data.mileage_unit ?? v.mileage_unit,
        data.notes !== undefined ? data.notes : v.notes,
        data.status ?? v.status,
        now,
        id,
        orgId,
      ],
    );

    return this.getById(orgId, id);
  }

  delete(orgId: string, id: string) {
    this.getById(orgId, id);
    const now = new Date().toISOString();
    this.db.run(
      'UPDATE vehicles SET deleted_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?',
      [now, now, id, orgId],
    );
    return { success: true, message: 'Vehicle deleted successfully' };
  }

  // Section 39: Unified vehicle history timeline combining inspection, work_order, document, media, reminder, task
  getHistory(orgId: string, vehicleId: string, query?: { page?: number; limit?: number }) {
    this.getById(orgId, vehicleId);

    const timeline: VehicleHistoryItem[] = [];

    // 1. Inspections
    const inspections = this.db.all<any>(
      `SELECT i.*, u.first_name, u.last_name
       FROM inspections i
       LEFT JOIN users u ON i.created_by = u.id
       WHERE i.vehicle_id = ? AND i.organization_id = ?`,
      [vehicleId, orgId],
    );
    for (const insp of inspections) {
      timeline.push({
        id: insp.id,
        type: 'inspection',
        title: `Приемка / Осмотр автомобиля (Пробег: ${insp.mileage} км)`,
        description: insp.customer_comment || insp.internal_comment || 'Первичный осмотр при приеме в сервис',
        status: insp.status,
        created_at: insp.created_at,
        user_name: `${insp.first_name || ''} ${insp.last_name || ''}`.trim(),
        metadata: {
          mileage: insp.mileage,
          fuel_level: insp.fuel_level,
          completed_at: insp.completed_at,
        },
        data: insp,
      });
    }

    // 2. Work Orders
    const workOrders = this.db.all<any>(
      `SELECT w.*, u.first_name, u.last_name
       FROM work_orders w
       LEFT JOIN users u ON w.advisor_id = u.id
       WHERE w.vehicle_id = ? AND w.organization_id = ?`,
      [vehicleId, orgId],
    );
    for (const wo of workOrders) {
      const items = this.db.all<any>(
        'SELECT * FROM work_order_items WHERE work_order_id = ?',
        [wo.id],
      );
      timeline.push({
        id: wo.id,
        type: 'work_order',
        title: `Заказ-наряд #${wo.number} (${wo.total} ₽)`,
        description: wo.customer_complaint || wo.diagnosis || `${items.length} позиций работ и запчастей`,
        status: wo.status,
        created_at: wo.created_at,
        user_name: `${wo.first_name || ''} ${wo.last_name || ''}`.trim(),
        metadata: {
          number: wo.number,
          total: wo.total,
          mileage_in: wo.mileage_in,
          mileage_out: wo.mileage_out,
          itemCount: items.length,
        },
        data: { ...wo, items },
      });
    }

    // 3. Documents
    const documents = this.db.all<any>(
      `SELECT d.*, u.first_name, u.last_name
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.vehicle_id = ? AND d.organization_id = ? AND d.deleted_at IS NULL`,
      [vehicleId, orgId],
    );
    for (const doc of documents) {
      timeline.push({
        id: doc.id,
        type: 'document',
        title: `Документ: ${doc.name}`,
        description: `Тип: ${doc.type}${doc.is_signed ? ' (Подписан)' : ''}`,
        status: doc.is_signed ? 'signed' : 'draft',
        created_at: doc.created_at,
        user_name: `${doc.first_name || ''} ${doc.last_name || ''}`.trim(),
        metadata: {
          type: doc.type,
          file_size: doc.file_size,
          is_signed: !!doc.is_signed,
        },
        data: doc,
      });
    }

    // 4. Media
    const mediaList = this.db.all<any>(
      `SELECT m.*, u.first_name, u.last_name
       FROM media m
       LEFT JOIN users u ON m.uploaded_by = u.id
       WHERE m.vehicle_id = ? AND m.organization_id = ? AND m.deleted_at IS NULL`,
      [vehicleId, orgId],
    );
    for (const med of mediaList) {
      timeline.push({
        id: med.id,
        type: 'media',
        title: `Медиафайл: ${med.type === 'video' ? 'Видео осмотра' : 'Фото автомобиля'}`,
        description: med.file_name,
        status: med.status,
        created_at: med.created_at,
        user_name: `${med.first_name || ''} ${med.last_name || ''}`.trim(),
        metadata: {
          type: med.type,
          mime_type: med.mime_type,
          file_size: med.file_size,
          duration: med.duration,
          damage_markers: med.metadata ? JSON.parse(med.metadata).damage_markers : [],
        },
        data: med,
      });
    }

    // 5. Reminders
    const reminders = this.db.all<any>(
      `SELECT r.*, u.first_name, u.last_name
       FROM reminders r
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.vehicle_id = ? AND r.organization_id = ?`,
      [vehicleId, orgId],
    );
    for (const rem of reminders) {
      timeline.push({
        id: rem.id,
        type: 'reminder',
        title: `Напоминание: ${rem.title}`,
        description: rem.description || (rem.target_mileage ? `Целевой пробег: ${rem.target_mileage} км` : ''),
        status: rem.status,
        created_at: rem.created_at,
        user_name: `${rem.first_name || ''} ${rem.last_name || ''}`.trim(),
        metadata: {
          target_date: rem.target_date,
          target_mileage: rem.target_mileage,
        },
        data: rem,
      });
    }

    // 6. Tasks
    const tasks = this.db.all<any>(
      `SELECT t.*, u.first_name, u.last_name
       FROM tasks t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.vehicle_id = ? AND t.organization_id = ?`,
      [vehicleId, orgId],
    );
    for (const task of tasks) {
      timeline.push({
        id: task.id,
        type: 'task',
        title: `Задача: ${task.title}`,
        description: task.description || '',
        status: task.status,
        created_at: task.created_at,
        user_name: `${task.first_name || ''} ${task.last_name || ''}`.trim(),
        metadata: {
          priority: task.priority,
          due_at: task.due_at,
          completed_at: task.completed_at,
        },
        data: task,
      });
    }

    // Sort all timeline events created_at DESC
    timeline.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
    const offset = (page - 1) * limit;

    const paginated = timeline.slice(offset, offset + limit);

    return {
      data: paginated,
      meta: {
        page,
        limit,
        total: timeline.length,
        totalPages: Math.ceil(timeline.length / limit),
      },
    };
  }
}
