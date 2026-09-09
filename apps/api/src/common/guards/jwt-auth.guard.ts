import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';
import { IS_PUBLIC_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-automotive-os-2026',
      });

      // Look up user in database
      const user = this.db.get<any>(
        `SELECT u.*, r.name as role_name, r.is_system as role_is_system, o.name as organization_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         JOIN organizations o ON u.organization_id = o.id
         WHERE u.id = ? AND u.status = 'active'`,
        [payload.sub || payload.id],
      );

      if (!user) {
        throw new UnauthorizedException({
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive',
        });
      }

      // Fetch user's permissions
      const perms = this.db.all<any>(
        `SELECT p.code
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?`,
        [user.role_id],
      );

      const permissionCodes = perms.map((p) => p.code);
      if (user.role_name === 'OWNER') {
        permissionCodes.push('*');
      }

      // Determine location scope
      // OWNER, NETWORK_ADMIN have all_locations; Others have current_location if location_id set
      const locationScope =
        user.role_name === 'OWNER' || user.role_name === 'NETWORK_ADMIN' || !user.location_id
          ? 'all_locations'
          : 'current_location';

      request.user = {
        id: user.id,
        organization_id: user.organization_id,
        location_id: user.location_id,
        role_id: user.role_id,
        role_name: user.role_name,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        permissions: permissionCodes,
        location_scope: locationScope,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      });
    }
  }
}
