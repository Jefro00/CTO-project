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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let NotificationsService = class NotificationsService {
    db;
    constructor(db) {
        this.db = db;
    }
    getAll(orgId, userId) {
        const rows = this.db.all(`SELECT * FROM notifications WHERE organization_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50`, [orgId, userId]);
        return rows.map((n) => ({
            ...n,
            is_read: !!n.is_read,
        }));
    }
    markAsRead(orgId, userId, id) {
        const now = new Date().toISOString();
        this.db.run(`UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ? AND organization_id = ? AND user_id = ?`, [now, id, orgId, userId]);
        const n = this.db.get('SELECT * FROM notifications WHERE id = ?', [id]);
        return {
            ...n,
            is_read: !!n?.is_read,
        };
    }
    markAllAsRead(orgId, userId) {
        const now = new Date().toISOString();
        this.db.run(`UPDATE notifications SET is_read = 1, read_at = ? WHERE organization_id = ? AND user_id = ? AND is_read = 0`, [now, orgId, userId]);
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map