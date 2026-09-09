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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    db;
    constructor(db) {
        this.db = db;
    }
    getAll(orgId, locationId) {
        let sql = `
      SELECT u.id, u.organization_id, u.location_id, u.role_id, u.first_name, u.last_name, u.phone, u.email, u.avatar_url, u.status, u.last_login_at, u.created_at, u.updated_at,
             r.name as role_name, r.is_system as role_is_system,
             l.name as location_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.organization_id = ?
    `;
        const params = [orgId];
        if (locationId) {
            sql += ' AND (u.location_id = ? OR u.location_id IS NULL)';
            params.push(locationId);
        }
        sql += ' ORDER BY u.created_at ASC';
        const rows = this.db.all(sql, params);
        return rows.map((u) => ({
            ...u,
            role: {
                id: u.role_id,
                name: u.role_name,
                is_system: !!u.role_is_system,
            },
            location: u.location_id ? { id: u.location_id, name: u.location_name } : null,
        }));
    }
    getById(orgId, id) {
        const user = this.db.get(`SELECT u.id, u.organization_id, u.location_id, u.role_id, u.first_name, u.last_name, u.phone, u.email, u.avatar_url, u.status, u.last_login_at, u.created_at, u.updated_at,
              r.name as role_name, r.is_system as role_is_system,
              l.name as location_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN locations l ON u.location_id = l.id
       WHERE u.id = ? AND u.organization_id = ?`, [id, orgId]);
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }
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
            location: user.location_id ? { id: user.location_id, name: user.location_name } : null,
        };
    }
    create(orgId, data) {
        const existing = this.db.get('SELECT id FROM users WHERE email = ?', [
            data.email.toLowerCase().trim(),
        ]);
        if (existing) {
            throw new common_1.ConflictException({
                code: 'USER_ALREADY_EXISTS',
                message: 'User with this email already exists',
            });
        }
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const passwordHash = bcrypt.hashSync(data.password || 'TemporaryPassword123!', 10);
        this.db.run(`INSERT INTO users (id, organization_id, location_id, role_id, first_name, last_name, phone, email, password_hash, avatar_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`, [
            id,
            orgId,
            data.location_id || null,
            data.role_id,
            data.first_name,
            data.last_name,
            data.phone || null,
            data.email.toLowerCase().trim(),
            passwordHash,
            data.avatar_url || null,
            now,
            now,
        ]);
        return this.getById(orgId, id);
    }
    update(orgId, id, data) {
        const user = this.getById(orgId, id);
        const now = new Date().toISOString();
        const firstName = data.first_name ?? user.first_name;
        const lastName = data.last_name ?? user.last_name;
        const phone = data.phone ?? user.phone;
        const locationId = data.location_id !== undefined ? data.location_id : user.location_id;
        const roleId = data.role_id ?? user.role_id;
        const status = data.status ?? user.status;
        const avatarUrl = data.avatar_url ?? user.avatar_url;
        let passHash = user.password_hash;
        if (data.password) {
            passHash = bcrypt.hashSync(data.password, 10);
        }
        this.db.run(`UPDATE users
       SET first_name = ?, last_name = ?, phone = ?, location_id = ?, role_id = ?, status = ?, avatar_url = ?, password_hash = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`, [firstName, lastName, phone, locationId, roleId, status, avatarUrl, passHash, now, id, orgId]);
        return this.getById(orgId, id);
    }
    delete(orgId, id, callerRole) {
        const targetUser = this.getById(orgId, id);
        if (targetUser.role_name === 'OWNER') {
            throw new common_1.ForbiddenException({
                code: 'CANNOT_DELETE_OWNER',
                message: 'Owner account cannot be deleted',
            });
        }
        this.db.run('DELETE FROM users WHERE id = ? AND organization_id = ?', [id, orgId]);
        return { success: true, message: 'User deleted successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map