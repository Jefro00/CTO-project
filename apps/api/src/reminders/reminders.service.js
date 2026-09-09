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
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
const types_1 = require("@automotive-os/types");
let RemindersService = class RemindersService {
    db;
    constructor(db) {
        this.db = db;
    }
    getAll(orgId, query) {
        let sql = `
      SELECT r.*,
             v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate, v.mileage as vehicle_mileage,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone
      FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN customers c ON r.customer_id = c.id
      WHERE r.organization_id = ?
    `;
        const params = [orgId];
        if (query?.vehicle_id) {
            sql += ' AND r.vehicle_id = ?';
            params.push(query.vehicle_id);
        }
        if (query?.customer_id) {
            sql += ' AND r.customer_id = ?';
            params.push(query.customer_id);
        }
        if (query?.status) {
            sql += ' AND r.status = ?';
            params.push(query.status);
        }
        sql += ' ORDER BY r.created_at DESC';
        const rows = this.db.all(sql, params);
        return rows.map((r) => ({
            ...r,
            vehicle: {
                id: r.vehicle_id,
                make: r.vehicle_make,
                model: r.vehicle_model,
                license_plate: r.vehicle_plate,
                mileage: r.vehicle_mileage,
            },
            customer: {
                id: r.customer_id,
                first_name: r.customer_first_name,
                last_name: r.customer_last_name,
                phone: r.customer_phone,
            },
        }));
    }
    getById(orgId, id) {
        const r = this.db.get(`SELECT r.*,
             v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate, v.mileage as vehicle_mileage,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone
      FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN customers c ON r.customer_id = c.id
      WHERE r.id = ? AND r.organization_id = ?`, [id, orgId]);
        if (!r) {
            throw new common_1.NotFoundException({
                code: 'REMINDER_NOT_FOUND',
                message: 'Reminder not found',
            });
        }
        return {
            ...r,
            vehicle: {
                id: r.vehicle_id,
                make: r.vehicle_make,
                model: r.vehicle_model,
                license_plate: r.vehicle_plate,
                mileage: r.vehicle_mileage,
            },
            customer: {
                id: r.customer_id,
                first_name: r.customer_first_name,
                last_name: r.customer_last_name,
                phone: r.customer_phone,
            },
        };
    }
    create(orgId, userId, userLocationId, data) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const locationId = data.location_id || userLocationId || 'default';
        this.db.run(`INSERT INTO reminders (
        id, organization_id, location_id, vehicle_id, customer_id, created_by,
        type, title, description, target_date, target_mileage, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            orgId,
            locationId,
            data.vehicle_id,
            data.customer_id,
            userId,
            data.type || types_1.ReminderType.DATE_OR_MILEAGE,
            data.title,
            data.description || null,
            data.target_date || null,
            data.target_mileage ? Number(data.target_mileage) : null,
            data.status || types_1.ReminderStatus.ACTIVE,
            now,
            now,
        ]);
        return this.getById(orgId, id);
    }
    update(orgId, id, data) {
        const r = this.getById(orgId, id);
        const now = new Date().toISOString();
        const title = data.title ?? r.title;
        const description = data.description !== undefined ? data.description : r.description;
        const type = data.type ?? r.type;
        const targetDate = data.target_date !== undefined ? data.target_date : r.target_date;
        const targetMileage = data.target_mileage !== undefined ? Number(data.target_mileage) : r.target_mileage;
        const status = data.status ?? r.status;
        this.db.run(`UPDATE reminders
       SET title = ?, description = ?, type = ?, target_date = ?, target_mileage = ?, status = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`, [title, description, type, targetDate, targetMileage, status, now, id, orgId]);
        return this.getById(orgId, id);
    }
    complete(orgId, id) {
        const r = this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run(`UPDATE reminders SET status = 'completed', updated_at = ? WHERE id = ? AND organization_id = ?`, [now, id, orgId]);
        return this.getById(orgId, id);
    }
};
exports.RemindersService = RemindersService;
exports.RemindersService = RemindersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map