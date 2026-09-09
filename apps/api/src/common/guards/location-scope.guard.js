"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationScopeGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
let LocationScopeGuard = class LocationScopeGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(require_permission_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            return true;
        // If user has all_locations scope (e.g. OWNER, NETWORK_ADMIN), they can access any location
        if (user.location_scope === 'all_locations') {
            return true;
        }
        // If request specifies a location_id query or param or body, verify user belongs to that location
        const targetLocationId = request.params?.locationId ||
            request.query?.location_id ||
            request.body?.location_id;
        if (targetLocationId && user.location_id && targetLocationId !== user.location_id) {
            throw new common_1.ForbiddenException({
                code: 'LOCATION_SCOPE_VIOLATION',
                message: 'You do not have permission to access or modify resources in other branches/locations',
            });
        }
        return true;
    }
};
exports.LocationScopeGuard = LocationScopeGuard;
exports.LocationScopeGuard = LocationScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], LocationScopeGuard);
//# sourceMappingURL=location-scope.guard.js.map