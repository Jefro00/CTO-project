import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
import { InspectionStatus, InspectionItemStatus } from '@automotive-os/types';

@Injectable()
export class InspectionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly ws: AppWebSocketGateway,
  ) {}

  getAll(
    orgId: string,
    query?: {
      page?: number;
      limit?: number;
      status?: string;
      location_id?: string;
      vehicle_id?: string;
    },
  ) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
    const offset = (page - 1) * limit;

    let sql = `
      SELECT i.*,
             v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate, v.vin as vehicle_vin,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone,
             u.first_name as creator_first_name, u.last_name as creator_last_name,
             l.name as location_name
      FROM inspections i
      JOIN vehicles v ON i.vehicle_id = v.id
      JOIN customers c ON i.customer_id = c.id
      JOIN users u ON i.created_by = u.id
      JOIN locations l ON i.location_id = l.id
      WHERE i.organization_id = ?
    `;
    const params: any[] = [orgId];

    if (query?.status) {
      sql += ' AND i.status = ?';
      params.push(query.status);
    }
    if (query?.location_id) {
      sql += ' AND i.location_id = ?';
      params.push(query.location_id);
    }
    if (query?.vehicle_id) {
      sql += ' AND i.vehicle_id = ?';
      params.push(query.vehicle_id);
    }

    const countRow = this.db.get<any>(`SELECT COUNT(*) as total FROM (${sql})`, params);
    const total = countRow?.total || 0;

    sql += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = this.db.all<any>(sql, params);

    const data = rows.map((i) => ({
      ...i,
      vehicle: {
        id: i.vehicle_id,
        make: i.vehicle_make,
        model: i.vehicle_model,
        license_plate: i.vehicle_plate,
        vin: i.vehicle_vin,
      },
      customer: {
        id: i.customer_id,
        first_name: i.customer_first_name,
        last_name: i.customer_last_name,
        phone: i.customer_phone,
      },
      creator: {
        id: i.created_by,
        first_name: i.creator_first_name,
        last_name: i.creator_last_name,
      },
      location: {
        id: i.location_id,
        name: i.location_name,
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

  getById(orgId: string, id: string) {
    const i = this.db.get<any>(
      `SELECT i.*,
             v.make as vehicle_make, v.model as vehicle_model, v.year as vehicle_year, v.license_plate as vehicle_plate, v.vin as vehicle_vin,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone, c.email as customer_email,
             u.first_name as creator_first_name, u.last_name as creator_last_name,
             l.name as location_name
      FROM inspections i
      JOIN vehicles v ON i.vehicle_id = v.id
      JOIN customers c ON i.customer_id = c.id
      JOIN users u ON i.created_by = u.id
      JOIN locations l ON i.location_id = l.id
      WHERE i.id = ? AND i.organization_id = ?`,
      [id, orgId],
    );

    if (!i) {
      throw new NotFoundException({
        code: 'INSPECTION_NOT_FOUND',
        message: 'Inspection not found',
      });
    }

    const items = this.db.all<any>(
      'SELECT * FROM inspection_items WHERE inspection_id = ? ORDER BY sort_order ASC, created_at ASC',
      [id],
    );

    const mediaList = this.db.all<any>(
      'SELECT * FROM media WHERE inspection_id = ? AND deleted_at IS NULL ORDER BY created_at ASC',
      [id],
    );

    const media = mediaList.map((m) => ({
      ...m,
      metadata: m.metadata ? JSON.parse(m.metadata) : null,
      download_url: `/api/v1/media/${m.id}/download-url`,
    }));

    return {
      ...i,
      items,
      media,
      vehicle: {
        id: i.vehicle_id,
        make: i.vehicle_make,
        model: i.vehicle_model,
        year: i.vehicle_year,
        license_plate: i.vehicle_plate,
        vin: i.vehicle_vin,
      },
      customer: {
        id: i.customer_id,
        first_name: i.customer_first_name,
        last_name: i.customer_last_name,
        phone: i.customer_phone,
        email: i.customer_email,
      },
      creator: {
        id: i.created_by,
        first_name: i.creator_first_name,
        last_name: i.creator_last_name,
      },
      location: {
        id: i.location_id,
        name: i.location_name,
      },
    };
  }

  create(orgId: string, userId: string, userLocationId: string | null, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const locationId = data.location_id || userLocationId;

    if (!locationId) {
      throw new BadRequestException({
        code: 'LOCATION_REQUIRED',
        message: 'Location ID is required for inspection',
      });
    }

    return this.db.transaction(() => {
      this.db.run(
        `INSERT INTO inspections (
          id, organization_id, location_id, vehicle_id, customer_id, created_by,
          mileage, fuel_level, status, customer_comment, internal_comment, started_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          orgId,
          locationId,
          data.vehicle_id,
          data.customer_id,
          userId,
          Number(data.mileage) || 0,
          Number(data.fuel_level) ?? 50,
          data.status || InspectionStatus.DRAFT,
          data.customer_comment || null,
          data.internal_comment || null,
          now,
          now,
          now,
        ],
      );

      // Create default checklist items if none supplied (Section 66: Body & Interior)
      const defaultItems = [
        { category: 'body', name: 'Передний бампер и оптика', sort_order: 1 },
        { category: 'body', name: 'Левая сторона (крылья, двери)', sort_order: 2 },
        { category: 'body', name: 'Правая сторона (крылья, двери)', sort_order: 3 },
        { category: 'body', name: 'Задняя часть и багажник', sort_order: 4 },
        { category: 'body', name: 'Крыша и остекление', sort_order: 5 },
        { category: 'interior', name: 'Передние сиденья и ремни', sort_order: 6 },
        { category: 'interior', name: 'Задний ряд сидений', sort_order: 7 },
        { category: 'interior', name: 'Приборная панель и мультимедиа', sort_order: 8 },
      ];

      const itemsToInsert = Array.isArray(data.items) && data.items.length > 0 ? data.items : defaultItems;

      for (const item of itemsToInsert) {
        this.db.run(
          `INSERT INTO inspection_items (id, inspection_id, category, name, status, comment, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            id,
            item.category || 'general',
            item.name,
            item.status || InspectionItemStatus.NOT_CHECKED,
            item.comment || null,
            item.sort_order || 0,
            now,
            now,
          ],
        );
      }

      // Update vehicle current mileage
      if (data.mileage) {
        this.db.run('UPDATE vehicles SET mileage = ?, updated_at = ? WHERE id = ?', [
          Number(data.mileage),
          now,
          data.vehicle_id,
        ]);
      }

      this.ws.emitToOrganization(orgId, 'inspection.updated', { inspectionId: id, status: 'created' });

      return this.getById(orgId, id);
    });
  }

  update(orgId: string, id: string, data: any) {
    const insp = this.getById(orgId, id);
    const now = new Date().toISOString();

    const mileage = data.mileage !== undefined ? Number(data.mileage) : insp.mileage;
    const fuelLevel = data.fuel_level !== undefined ? Number(data.fuel_level) : insp.fuel_level;
    const status = data.status ?? insp.status;
    const customerComment = data.customer_comment !== undefined ? data.customer_comment : insp.customer_comment;
    const internalComment = data.internal_comment !== undefined ? data.internal_comment : insp.internal_comment;

    this.db.run(
      `UPDATE inspections
       SET mileage = ?, fuel_level = ?, status = ?, customer_comment = ?, internal_comment = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`,
      [mileage, fuelLevel, status, customerComment, internalComment, now, id, orgId],
    );

    if (data.mileage) {
      this.db.run('UPDATE vehicles SET mileage = ?, updated_at = ? WHERE id = ?', [
        mileage,
        now,
        insp.vehicle_id,
      ]);
    }

    this.ws.emitToOrganization(orgId, 'inspection.updated', { inspectionId: id, status });

    return this.getById(orgId, id);
  }

  complete(orgId: string, id: string) {
    const insp = this.getById(orgId, id);
    const now = new Date().toISOString();

    this.db.run(
      `UPDATE inspections SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?`,
      [now, now, id, orgId],
    );

    // Create notification
    this.db.run(
      `INSERT INTO notifications (id, organization_id, user_id, type, title, body, entity_type, entity_id, is_read, created_at)
       VALUES (?, ?, ?, 'inspection.completed', 'Приемка завершена', ?, 'inspection', ?, 0, ?)`,
      [
        uuidv4(),
        orgId,
        insp.created_by,
        `Осмотр автомобиля ${insp.vehicle?.make} ${insp.vehicle?.model} (${insp.vehicle?.license_plate}) успешно завершен`,
        id,
        now,
      ],
    );

    this.ws.emitToOrganization(orgId, 'inspection.updated', { inspectionId: id, status: 'completed' });

    return this.getById(orgId, id);
  }

  cancel(orgId: string, id: string) {
    this.getById(orgId, id);
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE inspections SET status = 'cancelled', updated_at = ? WHERE id = ? AND organization_id = ?`,
      [now, id, orgId],
    );
    this.ws.emitToOrganization(orgId, 'inspection.updated', { inspectionId: id, status: 'cancelled' });
    return this.getById(orgId, id);
  }

  getItems(orgId: string, inspectionId: string) {
    this.getById(orgId, inspectionId);
    return this.db.all<any>(
      'SELECT * FROM inspection_items WHERE inspection_id = ? ORDER BY sort_order ASC, created_at ASC',
      [inspectionId],
    );
  }

  addItem(orgId: string, inspectionId: string, data: any) {
    this.getById(orgId, inspectionId);
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO inspection_items (id, inspection_id, category, name, status, comment, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        inspectionId,
        data.category || 'general',
        data.name,
        data.status || InspectionItemStatus.NOT_CHECKED,
        data.comment || null,
        Number(data.sort_order) || 0,
        now,
        now,
      ],
    );

    return this.db.get<any>('SELECT * FROM inspection_items WHERE id = ?', [id]);
  }

  updateItem(orgId: string, inspectionId: string, itemId: string, data: any) {
    this.getById(orgId, inspectionId);
    const item = this.db.get<any>(
      'SELECT * FROM inspection_items WHERE id = ? AND inspection_id = ?',
      [itemId, inspectionId],
    );
    if (!item) {
      throw new NotFoundException({
        code: 'ITEM_NOT_FOUND',
        message: 'Inspection item not found',
      });
    }

    const now = new Date().toISOString();
    this.db.run(
      `UPDATE inspection_items
       SET category = ?, name = ?, status = ?, comment = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.category ?? item.category,
        data.name ?? item.name,
        data.status ?? item.status,
        data.comment !== undefined ? data.comment : item.comment,
        data.sort_order !== undefined ? Number(data.sort_order) : item.sort_order,
        now,
        itemId,
      ],
    );

    return this.db.get<any>('SELECT * FROM inspection_items WHERE id = ?', [itemId]);
  }
}
