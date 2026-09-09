import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LOCATION_SCOPE_KEY, IS_PUBLIC_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class LocationScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return true;

    // If user has all_locations scope (e.g. OWNER, NETWORK_ADMIN), they can access any location
    if (user.location_scope === 'all_locations') {
      return true;
    }

    // If request specifies a location_id query or param or body, verify user belongs to that location
    const targetLocationId =
      request.params?.locationId ||
      request.query?.location_id ||
      request.body?.location_id;

    if (targetLocationId && user.location_id && targetLocationId !== user.location_id) {
      throw new ForbiddenException({
        code: 'LOCATION_SCOPE_VIOLATION',
        message: 'You do not have permission to access or modify resources in other branches/locations',
      });
    }

    return true;
  }
}
