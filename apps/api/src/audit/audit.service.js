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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let AuditService = class AuditService {
    db;
    constructor(db) {
        this.db = db;
    }
    getAll(orgId, query) {
        const page = Math.max(1, Number(query?.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
        const offset = (page - 1) * limit;
        let sql = `
      SELECT a.*, u.first_name, u.last_name, u.email as user_email
      FROM audit_logs a
      JOIN users u ON a.user_id = u.id
      WHERE a.organization_id = ?
    `;
        const params = [orgId];
        if (query?.entity_type) {
            sql += ' AND a.entity_type = ?';
            params.push(query.entity_type);
        }
        if (query?.action) {
            sql += ' AND a.action = ?';
            params.push(query.action);
        }
        const countRow = this.db.get(`SELECT COUNT(*) as total FROM (${sql})`, params);
        const total = countRow?.total || 0;
        sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        const rows = this.db.all(sql, params);
        return {
            data: rows.map((r) => ({
                ...r,
                old_values: r.old_values ? JSON.parse(r.old_values) : null,
                new_values: r.new_values ? JSON.parse(r.new_values) : null,
                user: {
                    id: r.user_id,
                    first_name: r.first_name,
                    last_name: r.last_name,
                    email: r.user_email,
                },
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    getById(orgId, id) {
        const r = this.db.get(`SELECT a.*, u.first_name, u.last_name, u.email as user_email
       FROM audit_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ? AND a.organization_id = ?`, [id, orgId]);
        if (!r) {
            throw new common_1.NotFoundException({
                code: 'AUDIT_LOG_NOT_FOUND',
                message: 'Audit log entry not found',
            });
        }
        return {
            ...r,
            old_values: r.old_values ? JSON.parse(r.old_values) : null,
            new_values: r.new_values ? JSON.parse(r.new_values) : null,
            user: {
                id: r.user_id,
                first_name: r.first_name,
                last_name: r.last_name,
                email: r.user_email,
            },
        };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuditService);
//# sourceMappingURL=audit.service.js.map