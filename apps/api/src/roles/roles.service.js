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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
let RolesService = class RolesService {
    db;
    constructor(db) {
        this.db = db;
    }
    getAll(orgId) {
        const roles = this.db.all(`SELECT * FROM roles WHERE organization_id = ? OR organization_id IS NULL ORDER BY is_system DESC, name ASC`, [orgId]);
        return roles.map((r) => {
            const perms = this.db.all(`SELECT p.id, p.code, p.description
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?`, [r.id]);
            return {
                ...r,
                is_system: !!r.is_system,
                permissions: perms,
            };
        });
    }
    getById(orgId, id) {
        const role = this.db.get(`SELECT * FROM roles WHERE id = ? AND (organization_id = ? OR organization_id IS NULL)`, [id, orgId]);
        if (!role) {
            throw new common_1.NotFoundException({
                code: 'ROLE_NOT_FOUND',
                message: 'Role not found',
            });
        }
        const perms = this.db.all(`SELECT p.id, p.code, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`, [role.id]);
        return {
            ...role,
            is_system: !!role.is_system,
            permissions: perms,
        };
    }
    create(orgId, data) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        return this.db.transaction(() => {
            this.db.run(`INSERT INTO roles (id, organization_id, name, description, is_system, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)`, [id, orgId, data.name, data.description || null, now, now]);
            if (Array.isArray(data.permission_ids)) {
                for (const pId of data.permission_ids) {
                    this.db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [id, pId]);
                }
            }
            return this.getById(orgId, id);
        });
    }
    update(orgId, id, data) {
        const role = this.getById(orgId, id);
        const now = new Date().toISOString();
        return this.db.transaction(() => {
            if (data.name !== undefined || data.description !== undefined) {
                this.db.run(`UPDATE roles SET name = ?, description = ?, updated_at = ? WHERE id = ?`, [data.name ?? role.name, data.description ?? role.description, now, id]);
            }
            if (Array.isArray(data.permission_ids)) {
                this.db.run('DELETE FROM role_permissions WHERE role_id = ?', [id]);
                for (const pId of data.permission_ids) {
                    this.db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [id, pId]);
                }
            }
            return this.getById(orgId, id);
        });
    }
    delete(orgId, id) {
        const role = this.getById(orgId, id);
        if (role.is_system) {
            throw new common_1.NotFoundException({
                code: 'CANNOT_DELETE_SYSTEM_ROLE',
                message: 'System role cannot be deleted',
            });
        }
        this.db.run('DELETE FROM roles WHERE id = ?', [id]);
        return { success: true, message: 'Role deleted' };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RolesService);
//# sourceMappingURL=roles.service.js.map