import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}

  getAll(orgId: string, userId: string) {
    const rows = this.db.all<any>(
      `SELECT * FROM notifications WHERE organization_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [orgId, userId],
    );
    return rows.map((n) => ({
      ...n,
      is_read: !!n.is_read,
    }));
  }

  markAsRead(orgId: string, userId: string, id: string) {
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ? AND organization_id = ? AND user_id = ?`,
      [now, id, orgId, userId],
    );
    const n = this.db.get<any>('SELECT * FROM notifications WHERE id = ?', [id]);
    return {
      ...n,
      is_read: !!n?.is_read,
    };
  }

  markAllAsRead(orgId: string, userId: string) {
    const now = new Date().toISOString();
    this.db.run(
      `UPDATE notifications SET is_read = 1, read_at = ? WHERE organization_id = ? AND user_id = ? AND is_read = 0`,
      [now, orgId, userId],
    );
    return { success: true };
  }
}
