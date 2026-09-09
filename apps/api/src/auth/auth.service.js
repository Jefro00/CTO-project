"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
const bcrypt = __importStar(require("bcryptjs"));
const permissions_1 = require("@automotive-os/permissions");
const types_1 = require("@automotive-os/types");
let AuthService = class AuthService {
    db;
    jwtService;
    constructor(db, jwtService) {
        this.db = db;
        this.jwtService = jwtService;
    }
    async register(data) {
        // Check if user already exists
        const existing = this.db.get('SELECT id FROM users WHERE email = ?', [data.email]);
        if (existing) {
            throw new common_1.ConflictException({
                code: 'USER_ALREADY_EXISTS',
                message: 'A user with this email address already exists',
            });
        }
        return this.db.transaction(() => {
            const orgId = (0, uuid_1.v4)();
            const locationId = (0, uuid_1.v4)();
            const userId = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            // 1. Create Organization
            this.db.run(`INSERT INTO organizations (id, name, legal_name, phone, email, timezone, currency, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'UTC+3', 'RUB', 'active', ?, ?)`, [orgId, data.organizationName, data.organizationName, data.phone || null, data.email, now, now]);
            // 2. Create Default Location
            this.db.run(`INSERT INTO locations (id, organization_id, name, timezone, status, created_at, updated_at)
         VALUES (?, ?, ?, 'UTC+3', 'active', ?, ?)`, [locationId, orgId, data.locationName || 'Главный филиал (СТО №1)', now, now]);
            // 3. Ensure permissions exist
            for (const [key, code] of Object.entries(permissions_1.PERMISSIONS)) {
                const pExist = this.db.get('SELECT id FROM permissions WHERE code = ?', [code]);
                if (!pExist) {
                    this.db.run('INSERT INTO permissions (id, code, description) VALUES (?, ?, ?)', [
                        (0, uuid_1.v4)(),
                        code,
                        `Permission for ${code}`,
                    ]);
                }
            }
            // 4. Create System Roles for this organization
            const systemRoles = Object.values(types_1.SystemRole);
            const roleMap = {};
            for (const rName of systemRoles) {
                const roleId = (0, uuid_1.v4)();
                this.db.run(`INSERT INTO roles (id, organization_id, name, description, is_system, created_at, updated_at)
           VALUES (?, ?, ?, ?, 1, ?, ?)`, [roleId, orgId, rName, `System role ${rName}`, now, now]);
                roleMap[rName] = roleId;
                // Assign permissions to role
                const allowedPerms = permissions_1.ROLE_PERMISSIONS[rName] || [];
                if (allowedPerms.includes('*')) {
                    // Grant all
                    const allPerms = this.db.all('SELECT id FROM permissions');
                    for (const p of allPerms) {
                        this.db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [
                            roleId,
                            p.id,
                        ]);
                    }
                }
                else {
                    for (const code of allowedPerms) {
                        const p = this.db.get('SELECT id FROM permissions WHERE code = ?', [code]);
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
            const ownerRoleId = roleMap[types_1.SystemRole.OWNER];
            this.db.run(`INSERT INTO users (id, organization_id, location_id, role_id, first_name, last_name, phone, email, password_hash, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`, [
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
            ]);
            const tokens = this.generateTokens(userId, orgId, ownerRoleId);
            const user = this.getUserById(userId);
            const organization = this.db.get('SELECT * FROM organizations WHERE id = ?', [orgId]);
            return {
                ...tokens,
                user,
                organization,
            };
        });
    }
    async login(email, pass) {
        const user = this.db.get(`SELECT u.*, r.name as role_name, o.name as organization_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = ?`, [email.toLowerCase().trim()]);
        if (!user) {
            throw new common_1.UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            });
        }
        if (user.status !== 'active') {
            throw new common_1.UnauthorizedException({
                code: 'ACCOUNT_SUSPENDED',
                message: 'User account is inactive or suspended',
            });
        }
        const isValid = bcrypt.compareSync(pass, user.password_hash);
        if (!isValid) {
            throw new common_1.UnauthorizedException({
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
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-for-automotive-os-2026',
            });
            const user = this.getUserById(payload.sub || payload.id);
            if (!user) {
                throw new common_1.UnauthorizedException({
                    code: 'INVALID_REFRESH_TOKEN',
                    message: 'Invalid refresh token',
                });
            }
            const tokens = this.generateTokens(user.id, user.organization_id, user.role_id);
            return {
                ...tokens,
                user,
            };
        }
        catch (e) {
            throw new common_1.UnauthorizedException({
                code: 'INVALID_REFRESH_TOKEN',
                message: 'Invalid or expired refresh token',
            });
        }
    }
    getUserById(id) {
        const user = this.db.get(`SELECT u.id, u.organization_id, u.location_id, u.role_id, u.first_name, u.last_name, u.phone, u.email, u.avatar_url, u.status, u.last_login_at, u.created_at, u.updated_at,
              r.name as role_name, r.is_system as role_is_system,
              l.name as location_name,
              o.name as organization_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN organizations o ON u.organization_id = o.id
       LEFT JOIN locations l ON u.location_id = l.id
       WHERE u.id = ?`, [id]);
        if (!user)
            return null;
        const perms = this.db.all(`SELECT p.code
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`, [user.role_id]);
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
    generateTokens(userId, orgId, roleId) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map