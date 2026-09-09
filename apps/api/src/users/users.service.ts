import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  getAll(orgId: string, locationId?: string) {
    let sql = `
      SELECT u.id, u.organization_id, u.location_id, u.role_id, u.first_name, u.last_name, u.phone, u.email, u.avatar_url, u.status, u.last_login_at, u.created_at, u.updated_at,
             r.name as role_name, r.is_system as role_is_system,
             l.name as location_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.organization_id = ?
    `;
    const params: any[] = [orgId];

    if (locationId) {
      sql += ' AND (u.location_id = ? OR u.location_id IS NULL)';
      params.push(locationId);
    }

    sql += ' ORDER BY u.created_at ASC';

    const rows = this.db.all<any>(sql, params);
    return rows.map((u) => ({
      ...u,
      role: {
        id: u.role_id,
        name: u.role_name,
        is_system: !!u.role_is_system,
      },
      location: u.location_id ? { id: u.location_id, name: u.location_name } : null,
    }));
  }

  getById(orgId: string, id: string) {
    const user = this.db.get<any>(
      `SELECT u.id, u.organization_id, u.location_id, u.role_id, u.first_name, u.last_name, u.phone, u.email, u.avatar_url, u.status, u.last_login_at, u.created_at, u.updated_at,
              r.name as role_name, r.is_system as role_is_system,
              l.name as location_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN locations l ON u.location_id = l.id
       WHERE u.id = ? AND u.organization_id = ?`,
      [id, orgId],
    );

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const perms = this.db.all<any>(
      `SELECT p.code
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`,
      [user.role_id],
    );

    const permissions = perms.map((p) => p.code);
    if (user.role_name === 'OWNER') {
      permissions.push('*');
    }

    return {
      ...user,
      permissions,
      role: {
        id: user.role_id,
        name: user.role_name,
        is_system: !!user.role_is_system,
      },
      location: user.location_id ? { id: user.location_id, name: user.location_name } : null,
    };
  }

  create(orgId: string, data: any) {
    const existing = this.db.get<any>('SELECT id FROM users WHERE email = ?', [
      data.email.toLowerCase().trim(),
    ]);
    if (existing) {
      throw new ConflictException({
        code: 'USER_ALREADY_EXISTS',
        message: 'User with this email already exists',
      });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const passwordHash = bcrypt.hashSync(data.password || 'TemporaryPassword123!', 10);

    this.db.run(
      `INSERT INTO users (id, organization_id, location_id, role_id, first_name, last_name, phone, email, password_hash, avatar_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        id,
        orgId,
        data.location_id || null,
        data.role_id,
        data.first_name,
        data.last_name,
        data.phone || null,
        data.email.toLowerCase().trim(),
        passwordHash,
        data.avatar_url || null,
        now,
        now,
      ],
    );

    return this.getById(orgId, id);
  }

  update(orgId: string, id: string, data: any) {
    const user = this.getById(orgId, id);
    const now = new Date().toISOString();

    const firstName = data.first_name ?? user.first_name;
    const lastName = data.last_name ?? user.last_name;
    const phone = data.phone ?? user.phone;
    const locationId = data.location_id !== undefined ? data.location_id : user.location_id;
    const roleId = data.role_id ?? user.role_id;
    const status = data.status ?? user.status;
    const avatarUrl = data.avatar_url ?? user.avatar_url;

    let passHash = user.password_hash;
    if (data.password) {
      passHash = bcrypt.hashSync(data.password, 10);
    }

    this.db.run(
      `UPDATE users
       SET first_name = ?, last_name = ?, phone = ?, location_id = ?, role_id = ?, status = ?, avatar_url = ?, password_hash = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`,
      [firstName, lastName, phone, locationId, roleId, status, avatarUrl, passHash, now, id, orgId],
    );

    return this.getById(orgId, id);
  }

  delete(orgId: string, id: string, callerRole: string) {
    const targetUser = this.getById(orgId, id);
    if (targetUser.role_name === 'OWNER') {
      throw new ForbiddenException({
        code: 'CANNOT_DELETE_OWNER',
        message: 'Owner account cannot be deleted',
      });
    }

    this.db.run('DELETE FROM users WHERE id = ? AND organization_id = ?', [id, orgId]);
    return { success: true, message: 'User deleted successfully' };
  }
}
