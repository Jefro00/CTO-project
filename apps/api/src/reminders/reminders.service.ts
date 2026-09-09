import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';
import { ReminderType, ReminderStatus } from '@automotive-os/types';

@Injectable()
export class RemindersService {
  constructor(private readonly db: DatabaseService) {}

  getAll(orgId: string, query?: { vehicle_id?: string; customer_id?: string; status?: string }) {
    let sql = `
      SELECT r.*,
             v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate, v.mileage as vehicle_mileage,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone
      FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN customers c ON r.customer_id = c.id
      WHERE r.organization_id = ?
    `;
    const params: any[] = [orgId];

    if (query?.vehicle_id) {
      sql += ' AND r.vehicle_id = ?';
      params.push(query.vehicle_id);
    }
    if (query?.customer_id) {
      sql += ' AND r.customer_id = ?';
      params.push(query.customer_id);
    }
    if (query?.status) {
      sql += ' AND r.status = ?';
      params.push(query.status);
    }

    sql += ' ORDER BY r.created_at DESC';

    const rows = this.db.all<any>(sql, params);
    return rows.map((r) => ({
      ...r,
      vehicle: {
        id: r.vehicle_id,
        make: r.vehicle_make,
        model: r.vehicle_model,
        license_plate: r.vehicle_plate,
        mileage: r.vehicle_mileage,
      },
      customer: {
        id: r.customer_id,
        first_name: r.customer_first_name,
        last_name: r.customer_last_name,
        phone: r.customer_phone,
      },
    }));
  }

  getById(orgId: string, id: string) {
    const r = this.db.get<any>(
      `SELECT r.*,
             v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate, v.mileage as vehicle_mileage,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone
      FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN customers c ON r.customer_id = c.id
      WHERE r.id = ? AND r.organization_id = ?`,
      [id, orgId],
    );

    if (!r) {
      throw new NotFoundException({
        code: 'REMINDER_NOT_FOUND',
        message: 'Reminder not found',
      });
    }

    return {
      ...r,
      vehicle: {
        id: r.vehicle_id,
        make: r.vehicle_make,
        model: r.vehicle_model,
        license_plate: r.vehicle_plate,
        mileage: r.vehicle_mileage,
      },
      customer: {
        id: r.customer_id,
        first_name: r.customer_first_name,
        last_name: r.customer_last_name,
        phone: r.customer_phone,
      },
    };
  }

  create(orgId: string, userId: string, userLocationId: string | null, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const locationId = data.location_id || userLocationId || 'default';

    this.db.run(
      `INSERT INTO reminders (
        id, organization_id, location_id, vehicle_id, customer_id, created_by,
        type, title, description, target_date, target_mileage, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        orgId,
        locationId,
        data.vehicle_id,
        data.customer_id,
        userId,
        data.type || ReminderType.DATE_OR_MILEAGE,
        data.title,
        data.description || null,
        data.target_date || null,
        data.target_mileage ? Number(data.target_mileage) : null,
        data.status || ReminderStatus.ACTIVE,
        now,
        now,
      ],
    );

    return this.getById(orgId, id);
  }

  update(orgId: string, id: string, data: any) {
    const r = this.getById(orgId, id);
    const now = new Date().toISOString();

    const title = data.title ?? r.title;
    const description = data.description !== undefined ? data.description : r.description;
    const type = data.type ?? r.type;
    const targetDate = data.target_date !== undefined ? data.target_date : r.target_date;
    const targetMileage = data.target_mileage !== undefined ? Number(data.target_mileage) : r.target_mileage;
    const status = data.status ?? r.status;

    this.db.run(
      `UPDATE reminders
       SET title = ?, description = ?, type = ?, target_date = ?, target_mileage = ?, status = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`,
      [title, description, type, targetDate, targetMileage, status, now, id, orgId],
    );

    return this.getById(orgId, id);
  }

  complete(orgId: string, id: string) {
    const r = this.getById(orgId, id);
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE reminders SET status = 'completed', updated_at = ? WHERE id = ? AND organization_id = ?`,
      [now, id, orgId],
    );
    return this.getById(orgId, id);
  }
}
