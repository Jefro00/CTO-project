import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, IS_PUBLIC_KEY } from '../decorators/require-permission.decorator';
import { hasPermission } from '@automotive-os/permissions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'Insufficient permissions',
      });
    }

    const allowed = hasPermission(user.permissions, requiredPermission);

    if (!allowed) {
      throw new ForbiddenException({
        code: 'FORBIDDEN_PERMISSION',
        message: `Missing required permission: ${requiredPermission}`,
      });
    }

    return true;
  }
}
