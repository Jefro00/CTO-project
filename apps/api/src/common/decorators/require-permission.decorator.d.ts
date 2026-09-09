export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const PERMISSION_KEY = "permission";
export declare const RequirePermission: (permission: string) => import("@nestjs/common").CustomDecorator<string>;
export declare const LOCATION_SCOPE_KEY = "locationScope";
export declare const LocationScope: (scope?: "strict" | "current" | "all") => import("@nestjs/common").CustomDecorator<string>;
