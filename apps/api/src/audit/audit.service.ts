import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  getAll(
    orgId: string,
    query?: {
      page?: number;
      limit?: number;
      entity_type?: string;
      action?: string;
    },
  ) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
    const offset = (page - 1) * limit;

    let sql = `
      SELECT a.*, u.first_name, u.last_name, u.email as user_email
      FROM audit_logs a
      JOIN users u ON a.user_id = u.id
      WHERE a.organization_id = ?
    `;
    const params: any[] = [orgId];

    if (query?.entity_type) {
      sql += ' AND a.entity_type = ?';
      params.push(query.entity_type);
    }
    if (query?.action) {
      sql += ' AND a.action = ?';
      params.push(query.action);
    }

    const countRow = this.db.get<any>(`SELECT COUNT(*) as total FROM (${sql})`, params);
    const total = countRow?.total || 0;

    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = this.db.all<any>(sql, params);

    return {
      data: rows.map((r) => ({
        ...r,
        old_values: r.old_values ? JSON.parse(r.old_values) : null,
        new_values: r.new_values ? JSON.parse(r.new_values) : null,
        user: {
          id: r.user_id,
          first_name: r.first_name,
          last_name: r.last_name,
          email: r.user_email,
        },
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  getById(orgId: string, id: string) {
    const r = this.db.get<any>(
      `SELECT a.*, u.first_name, u.last_name, u.email as user_email
       FROM audit_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ? AND a.organization_id = ?`,
      [id, orgId],
    );

    if (!r) {
      throw new NotFoundException({
        code: 'AUDIT_LOG_NOT_FOUND',
        message: 'Audit log entry not found',
      });
    }

    return {
      ...r,
      old_values: r.old_values ? JSON.parse(r.old_values) : null,
      new_values: r.new_values ? JSON.parse(r.new_values) : null,
      user: {
        id: r.user_id,
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.user_email,
      },
    };
  }
}
