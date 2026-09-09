import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
import { TaskStatus, TaskPriority } from '@automotive-os/types';

@Injectable()
export class TasksService {
  constructor(
    private readonly db: DatabaseService,
    private readonly ws: AppWebSocketGateway,
  ) {}

  getAll(
    orgId: string,
    query?: {
      assigned_to?: string;
      status?: string;
      priority?: string;
      location_id?: string;
      vehicle_id?: string;
    },
  ) {
    let sql = `
      SELECT t.*,
             u.first_name as assignee_first_name, u.last_name as assignee_last_name,
             c.first_name as creator_first_name, c.last_name as creator_last_name,
             v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate,
             cust.first_name as customer_first_name, cust.last_name as customer_last_name
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN customers cust ON t.customer_id = cust.id
      WHERE t.organization_id = ?
    `;
    const params: any[] = [orgId];

    if (query?.assigned_to) {
      sql += ' AND t.assigned_to = ?';
      params.push(query.assigned_to);
    }
    if (query?.status) {
      sql += ' AND t.status = ?';
      params.push(query.status);
    }
    if (query?.priority) {
      sql += ' AND t.priority = ?';
      params.push(query.priority);
    }
    if (query?.location_id) {
      sql += ' AND t.location_id = ?';
      params.push(query.location_id);
    }
    if (query?.vehicle_id) {
      sql += ' AND t.vehicle_id = ?';
      params.push(query.vehicle_id);
    }

    sql += ' ORDER BY CASE t.priority WHEN "critical" THEN 1 WHEN "high" THEN 2 WHEN "normal" THEN 3 ELSE 4 END, t.created_at DESC';

    const rows = this.db.all<any>(sql, params);
    return rows.map((t) => ({
      ...t,
      assignee: {
        id: t.assigned_to,
        first_name: t.assignee_first_name,
        last_name: t.assignee_last_name,
      },
      creator: {
        id: t.created_by,
        first_name: t.creator_first_name,
        last_name: t.creator_last_name,
      },
      vehicle: t.vehicle_id
        ? {
            id: t.vehicle_id,
            make: t.vehicle_make,
            model: t.vehicle_model,
            license_plate: t.vehicle_plate,
          }
        : null,
      customer: t.customer_id
        ? {
            id: t.customer_id,
            first_name: t.customer_first_name,
            last_name: t.customer_last_name,
          }
        : null,
    }));
  }

  getById(orgId: string, id: string) {
    const t = this.db.get<any>(
      `SELECT t.*,
             u.first_name as assignee_first_name, u.last_name as assignee_last_name,
             c.first_name as creator_first_name, c.last_name as creator_last_name,
             v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.id = ? AND t.organization_id = ?`,
      [id, orgId],
    );

    if (!t) {
      throw new NotFoundException({
        code: 'TASK_NOT_FOUND',
        message: 'Task not found',
      });
    }

    return {
      ...t,
      assignee: {
        id: t.assigned_to,
        first_name: t.assignee_first_name,
        last_name: t.assignee_last_name,
      },
      creator: {
        id: t.created_by,
        first_name: t.creator_first_name,
        last_name: t.creator_last_name,
      },
      vehicle: t.vehicle_id
        ? {
            id: t.vehicle_id,
            make: t.vehicle_make,
            model: t.vehicle_model,
            license_plate: t.vehicle_plate,
          }
        : null,
    };
  }

  create(orgId: string, userId: string, userLocationId: string | null, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const locationId = data.location_id || userLocationId || 'default';

    this.db.run(
      `INSERT INTO tasks (
        id, organization_id, location_id, vehicle_id, customer_id, work_order_id,
        assigned_to, created_by, title, description, priority, status, due_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        orgId,
        locationId,
        data.vehicle_id || null,
        data.customer_id || null,
        data.work_order_id || null,
        data.assigned_to || userId,
        userId,
        data.title,
        data.description || null,
        data.priority || TaskPriority.NORMAL,
        data.status || TaskStatus.NEW,
        data.due_at || null,
        now,
        now,
      ],
    );

    // Notify assigned user
    if (data.assigned_to) {
      this.db.run(
        `INSERT INTO notifications (id, organization_id, user_id, type, title, body, entity_type, entity_id, is_read, created_at)
         VALUES (?, ?, ?, 'task.created', 'Новая задача', ?, 'task', ?, 0, ?)`,
        [uuidv4(), orgId, data.assigned_to, data.title, id, now],
      );
      this.ws.emitToUser(data.assigned_to, 'notification.created', { title: 'Новая задача', body: data.title });
    }

    this.ws.emitToOrganization(orgId, 'task.created', { taskId: id, title: data.title });

    return this.getById(orgId, id);
  }

  update(orgId: string, id: string, data: any) {
    const t = this.getById(orgId, id);
    const now = new Date().toISOString();

    const title = data.title ?? t.title;
    const description = data.description !== undefined ? data.description : t.description;
    const priority = data.priority ?? t.priority;
    const status = data.status ?? t.status;
    const assignedTo = data.assigned_to ?? t.assigned_to;
    const dueAt = data.due_at !== undefined ? data.due_at : t.due_at;
    const completedAt = status === TaskStatus.COMPLETED && !t.completed_at ? now : t.completed_at;

    this.db.run(
      `UPDATE tasks
       SET title = ?, description = ?, priority = ?, status = ?, assigned_to = ?, due_at = ?, completed_at = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`,
      [title, description, priority, status, assignedTo, dueAt, completedAt, now, id, orgId],
    );

    return this.getById(orgId, id);
  }

  complete(orgId: string, id: string) {
    const t = this.getById(orgId, id);
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE tasks SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?`,
      [now, now, id, orgId],
    );
    return this.getById(orgId, id);
  }
}
