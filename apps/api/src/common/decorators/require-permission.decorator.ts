import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);

export const LOCATION_SCOPE_KEY = 'locationScope';
export const LocationScope = (scope: 'strict' | 'current' | 'all' = 'current') =>
  SetMetadata(LOCATION_SCOPE_KEY, scope);
