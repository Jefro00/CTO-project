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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const database_service_1 = require("../../database/database.service");
const uuid_1 = require("uuid");
let AuditInterceptor = class AuditInterceptor {
    db;
    constructor(db) {
        this.db = db;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        // Only audit mutating methods or sensitive actions
        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            return next.handle();
        }
        const path = req.path || req.url;
        // Skip health, auth/login, websocket
        if (path.includes('/health') || path.includes('/auth/login')) {
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: (result) => {
                this.logAudit(req, result);
            },
            error: () => {
                // Log failed attempt if needed
            },
        }));
    }
    logAudit(req, result) {
        try {
            const user = req.user;
            if (!user || !user.organization_id)
                return;
            const path = req.path || req.url;
            const parts = path.split('/').filter(Boolean);
            // Example: /api/v1/vehicles/:id -> entity_type = 'vehicles'
            const entityType = parts[2] || 'unknown';
            const entityId = req.params?.id || (result?.data?.id) || (result?.id) || 'bulk';
            let action = 'mutation';
            if (req.method === 'POST')
                action = 'create';
            if (req.method === 'PATCH' || req.method === 'PUT')
                action = 'update';
            if (req.method === 'DELETE')
                action = 'delete';
            if (path.includes('/restore'))
                action = 'restore';
            if (path.includes('/complete'))
                action = 'complete';
            const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
            const userAgent = req.headers['user-agent'] || 'internal';
            this.db.run(`INSERT INTO audit_logs (id, organization_id, location_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                (0, uuid_1.v4)(),
                user.organization_id,
                user.location_id || null,
                user.id,
                action,
                entityType,
                String(entityId),
                null,
                req.body ? JSON.stringify(this.sanitizeBody(req.body)) : null,
                String(ip),
                String(userAgent),
                new Date().toISOString(),
            ]);
        }
        catch (err) {
            // Don't fail the request if audit log fails, but log error
            console.error('Failed to write audit log:', err);
        }
    }
    sanitizeBody(body) {
        if (!body || typeof body !== 'object')
            return body;
        const sanitized = { ...body };
        delete sanitized.password;
        delete sanitized.password_hash;
        delete sanitized.refreshToken;
        return sanitized;
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map