import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RolesService {
  constructor(private readonly db: DatabaseService) {}

  getAll(orgId: string) {
    const roles = this.db.all<any>(
      `SELECT * FROM roles WHERE organization_id = ? OR organization_id IS NULL ORDER BY is_system DESC, name ASC`,
      [orgId],
    );

    return roles.map((r) => {
      const perms = this.db.all<any>(
        `SELECT p.id, p.code, p.description
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?`,
        [r.id],
      );
      return {
        ...r,
        is_system: !!r.is_system,
        permissions: perms,
      };
    });
  }

  getById(orgId: string, id: string) {
    const role = this.db.get<any>(
      `SELECT * FROM roles WHERE id = ? AND (organization_id = ? OR organization_id IS NULL)`,
      [id, orgId],
    );

    if (!role) {
      throw new NotFoundException({
        code: 'ROLE_NOT_FOUND',
        message: 'Role not found',
      });
    }

    const perms = this.db.all<any>(
      `SELECT p.id, p.code, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`,
      [role.id],
    );

    return {
      ...role,
      is_system: !!role.is_system,
      permissions: perms,
    };
  }

  create(orgId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    return this.db.transaction(() => {
      this.db.run(
        `INSERT INTO roles (id, organization_id, name, description, is_system, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [id, orgId, data.name, data.description || null, now, now],
      );

      if (Array.isArray(data.permission_ids)) {
        for (const pId of data.permission_ids) {
          this.db.run(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [id, pId],
          );
        }
      }

      return this.getById(orgId, id);
    });
  }

  update(orgId: string, id: string, data: any) {
    const role = this.getById(orgId, id);
    const now = new Date().toISOString();

    return this.db.transaction(() => {
      if (data.name !== undefined || data.description !== undefined) {
        this.db.run(
          `UPDATE roles SET name = ?, description = ?, updated_at = ? WHERE id = ?`,
          [data.name ?? role.name, data.description ?? role.description, now, id],
        );
      }

      if (Array.isArray(data.permission_ids)) {
        this.db.run('DELETE FROM role_permissions WHERE role_id = ?', [id]);
        for (const pId of data.permission_ids) {
          this.db.run(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [id, pId],
          );
        }
      }

      return this.getById(orgId, id);
    });
  }

  delete(orgId: string, id: string) {
    const role = this.getById(orgId, id);
    if (role.is_system) {
      throw new NotFoundException({
        code: 'CANNOT_DELETE_SYSTEM_ROLE',
        message: 'System role cannot be deleted',
      });
    }
    this.db.run('DELETE FROM roles WHERE id = ?', [id]);
    return { success: true, message: 'Role deleted' };
  }
}
