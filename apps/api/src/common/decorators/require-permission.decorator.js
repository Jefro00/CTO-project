"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationScope = exports.LOCATION_SCOPE_KEY = exports.RequirePermission = exports.PERMISSION_KEY = exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.PERMISSION_KEY = 'permission';
const RequirePermission = (permission) => (0, common_1.SetMetadata)(exports.PERMISSION_KEY, permission);
exports.RequirePermission = RequirePermission;
exports.LOCATION_SCOPE_KEY = 'locationScope';
const LocationScope = (scope = 'current') => (0, common_1.SetMetadata)(exports.LOCATION_SCOPE_KEY, scope);
exports.LocationScope = LocationScope;
//# sourceMappingURL=require-permission.decorator.js.map