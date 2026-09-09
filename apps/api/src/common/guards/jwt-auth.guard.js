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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const database_service_1 = require("../../database/database.service");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
let JwtAuthGuard = class JwtAuthGuard {
    reflector;
    jwtService;
    db;
    constructor(reflector, jwtService, db) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.db = db;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(require_permission_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException({
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
            const user = this.db.get(`SELECT u.*, r.name as role_name, r.is_system as role_is_system, o.name as organization_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         JOIN organizations o ON u.organization_id = o.id
         WHERE u.id = ? AND u.status = 'active'`, [payload.sub || payload.id]);
            if (!user) {
                throw new common_1.UnauthorizedException({
                    code: 'USER_NOT_FOUND',
                    message: 'User not found or inactive',
                });
            }
            // Fetch user's permissions
            const perms = this.db.all(`SELECT p.code
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?`, [user.role_id]);
            const permissionCodes = perms.map((p) => p.code);
            if (user.role_name === 'OWNER') {
                permissionCodes.push('*');
            }
            // Determine location scope
            // OWNER, NETWORK_ADMIN have all_locations; Others have current_location if location_id set
            const locationScope = user.role_name === 'OWNER' || user.role_name === 'NETWORK_ADMIN' || !user.location_id
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
        }
        catch (err) {
            throw new common_1.UnauthorizedException({
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired token',
            });
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService,
        database_service_1.DatabaseService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map