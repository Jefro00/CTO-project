import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { ROLE_PERMISSIONS, PERMISSIONS } from '@automotive-os/permissions';
import { SystemRole } from '@automotive-os/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: {
    organizationName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    locationName?: string;
  }) {
    // Check if user already exists
    const existing = this.db.get<any>('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existing) {
      throw new ConflictException({
        code: 'USER_ALREADY_EXISTS',
        message: 'A user with this email address already exists',
      });
    }

    return this.db.transaction(() => {
      const orgId = uuidv4();
      const locationId = uuidv4();
      const userId = uuidv4();
      const now = new Date().toISOString();

      // 1. Create Organization
      this.db.run(
        `INSERT INTO organizations (id, name, legal_name, phone, email, timezone, currency, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'UTC+3', 'RUB', 'active', ?, ?)`,
        [orgId, data.organizationName, data.organizationName, data.phone || null, data.email, now, now],
      );

      // 2. Create Default Location
      this.db.run(
        `INSERT INTO locations (id, organization_id, name, timezone, status, created_at, updated_at)
         VALUES (?, ?, ?, 'UTC+3', 'active', ?, ?)`,
        [locationId, orgId, data.locationName || 'Главный филиал (СТО №1)', now, now],
      );

      // 3. Ensure permissions exist
      for (const [key, code] of Object.entries(PERMISSIONS)) {
        const pExist = this.db.get<any>('SELECT id FROM permissions WHERE code = ?', [code]);
        if (!pExist) {
          this.db.run('INSERT INTO permissions (id, code, description) VALUES (?, ?, ?)', [
            uuidv4(),
            code,
            `Permission for ${code}`,
          ]);
        }
      }

      // 4. Create System Roles for this organization
      const systemRoles = Object.values(SystemRole);
      const roleMap: Record<string, string> = {};

      for (const rName of systemRoles) {
        const roleId = uuidv4();
        this.db.run(
          `INSERT INTO roles (id, organization_id, name, description, is_system, created_at, updated_at)
           VALUES (?, ?, ?, ?, 1, ?, ?)`,
          [roleId, orgId, rName, `System role ${rName}`, now, now],
        );
        roleMap[rName] = roleId;

        // Assign permissions to role
        const allowedPerms = ROLE_PERMISSIONS[rName as SystemRole] || [];
        if (allowedPerms.includes('*')) {
          // Grant all
          const allPerms = this.db.all<any>('SELECT id FROM permissions');
          for (const p of allPerms) {
            this.db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [
              roleId,
              p.id,
            ]);
          }
        } else {
          for (const code of allowedPerms) {
            const p = this.db.get<any>('SELECT id FROM permissions WHERE code = ?', [code]);
            if (p) {
              this.db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [
                roleId,
                p.id,
              ]);
            }
          }
        }
      }

      // 5. Create Owner User
      const passwordHash = bcrypt.hashSync(data.password, 10);
      const ownerRoleId = roleMap[SystemRole.OWNER];

      this.db.run(
        `INSERT INTO users (id, organization_id, location_id, role_id, first_name, last_name, phone, email, password_hash, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        [
          userId,
          orgId,
          locationId,
          ownerRoleId,
          data.firstName,
          data.lastName,
          data.phone || null,
          data.email,
          passwordHash,
          now,
          now,
        ],
      );

      const tokens = this.generateTokens(userId, orgId, ownerRoleId);

      const user = this.getUserById(userId);
      const organization = this.db.get<any>('SELECT * FROM organizations WHERE id = ?', [orgId]);

      return {
        ...tokens,
        user,
        organization,
      };
    });
  }

  async login(email: string, pass: string) {
    const user = this.db.get<any>(
      `SELECT u.*, r.name as role_name, o.name as organization_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = ?`,
      [email.toLowerCase().trim()],
    );

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException({
        code: 'ACCOUNT_SUSPENDED',
        message: 'User account is inactive or suspended',
      });
    }

    const isValid = bcrypt.compareSync(pass, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Update last login
    const now = new Date().toISOString();
    this.db.run('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?', [
      now,
      now,
      user.id,
    ]);

    const tokens = this.generateTokens(user.id, user.organization_id, user.role_id);
    const fullUser = this.getUserById(user.id);

    return {
      ...tokens,
      user: fullUser,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-for-automotive-os-2026',
      });

      const user = this.getUserById(payload.sub || payload.id);
      if (!user) {
        throw new UnauthorizedException({
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token',
        });
      }

      const tokens = this.generateTokens(user.id, user.organization_id, user.role_id);
      return {
        ...tokens,
        user,
      };
    } catch (e) {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
      });
    }
  }

  getUserById(id: string) {
    const user = this.db.get<any>(
      `SELECT u.id, u.organization_id, u.location_id, u.role_id, u.first_name, u.last_name, u.phone, u.email, u.avatar_url, u.status, u.last_login_at, u.created_at, u.updated_at,
              r.name as role_name, r.is_system as role_is_system,
              l.name as location_name,
              o.name as organization_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN organizations o ON u.organization_id = o.id
       LEFT JOIN locations l ON u.location_id = l.id
       WHERE u.id = ?`,
      [id],
    );

    if (!user) return null;

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
      location: user.location_id
        ? {
            id: user.location_id,
            name: user.location_name,
          }
        : null,
      organization: {
        id: user.organization_id,
        name: user.organization_name,
      },
    };
  }

  private generateTokens(userId: string, orgId: string, roleId: string) {
    const payload = { sub: userId, orgId, roleId };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-automotive-os-2026',
      expiresIn: '24h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-for-automotive-os-2026',
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
}
