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
exports.InspectionsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const types_1 = require("@automotive-os/types");
let InspectionsService = class InspectionsService {
    db;
    ws;
    constructor(db, ws) {
        this.db = db;
        this.ws = ws;
    }
    getAll(orgId, query) {
        const page = Math.max(1, Number(query?.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
        const offset = (page - 1) * limit;
        let sql = `
      SELECT i.*,
             v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate, v.vin as vehicle_vin,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone,
             u.first_name as creator_first_name, u.last_name as creator_last_name,
             l.name as location_name
      FROM inspections i
      JOIN vehicles v ON i.vehicle_id = v.id
      JOIN customers c ON i.customer_id = c.id
      JOIN users u ON i.created_by = u.id
      JOIN locations l ON i.location_id = l.id
      WHERE i.organization_id = ?
    `;
        const params = [orgId];
        if (query?.status) {
            sql += ' AND i.status = ?';
            params.push(query.status);
        }
        if (query?.location_id) {
            sql += ' AND i.location_id = ?';
            params.push(query.location_id);
        }
        if (query?.vehicle_id) {
            sql += ' AND i.vehicle_id = ?';
            params.push(query.vehicle_id);
        }
        const countRow = this.db.get(`SELECT COUNT(*) as total FROM (${sql})`, params);
        const total = countRow?.total || 0;
        sql += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        const rows = this.db.all(sql, params);
        const data = rows.map((i) => ({
            ...i,
            vehicle: {
                id: i.vehicle_id,
                make: i.vehicle_make,
                model: i.vehicle_model,
                license_plate: i.vehicle_plate,
                vin: i.vehicle_vin,
            },
            customer: {
                id: i.customer_id,
                first_name: i.customer_first_name,
                last_name: i.customer_last_name,
                phone: i.customer_phone,
            },
            creator: {
                id: i.created_by,
                first_name: i.creator_first_name,
                last_name: i.creator_last_name,
            },
            location: {
                id: i.location_id,
                name: i.location_name,
            },
        }));
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    getById(orgId, id) {
        const i = this.db.get(`SELECT i.*,
             v.make as vehicle_make, v.model as vehicle_model, v.year as vehicle_year, v.license_plate as vehicle_plate, v.vin as vehicle_vin,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone, c.email as customer_email,
             u.first_name as creator_first_name, u.last_name as creator_last_name,
             l.name as location_name
      FROM inspections i
      JOIN vehicles v ON i.vehicle_id = v.id
      JOIN customers c ON i.customer_id = c.id
      JOIN users u ON i.created_by = u.id
      JOIN locations l ON i.location_id = l.id
      WHERE i.id = ? AND i.organization_id = ?`, [id, orgId]);
        if (!i) {
            throw new common_1.NotFoundException({
                code: 'INSPECTION_NOT_FOUND',
                message: 'Inspection not found',
            });
        }
        const items = this.db.all('SELECT * FROM inspection_items WHERE inspection_id = ? ORDER BY sort_order ASC, created_at ASC', [id]);
        const mediaList = this.db.all('SELECT * FROM media WHERE inspection_id = ? AND deleted_at IS NULL ORDER BY created_at ASC', [id]);
        const media = mediaList.map((m) => ({
            ...m,
            metadata: m.metadata ? JSON.parse(m.metadata) : null,
            download_url: `/api/v1/media/${m.id}/download-url`,
        }));
        return {
            ...i,
            items,
            media,
            vehicle: {
                id: i.vehicle_id,
                make: i.vehicle_make,
                model: i.vehicle_model,
                year: i.vehicle_year,
                license_plate: i.vehicle_plate,
                vin: i.vehicle_vin,
            },
            customer: {
                id: i.customer_id,
                first_name: i.customer_first_name,
                last_name: i.customer_last_name,
                phone: i.customer_phone,
                email: i.customer_email,
            },
            creator: {
                id: i.created_by,
                first_name: i.creator_first_name,
                last_name: i.creator_last_name,
            },
            location: {
                id: i.location_id,
                name: i.location_name,
            },
        };
    }
    create(orgId, userId, userLocationId, data) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        let locationId = data.location_id || userLocationId;
        if (!locationId) {
            const defaultLoc = this.db.get('SELECT id FROM locations WHERE organization_id = ? ORDER BY created_at ASC LIMIT 1', [orgId]);
            locationId = defaultLoc?.id;
        }
        if (!locationId) {
            throw new common_1.BadRequestException({
                code: 'LOCATION_REQUIRED',
                message: 'Location ID is required for inspection',
            });
        }
        return this.db.transaction(() => {
            this.db.run(`INSERT INTO inspections (
          id, organization_id, location_id, vehicle_id, customer_id, created_by,
          mileage, fuel_level, status, customer_comment, internal_comment, started_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                orgId,
                locationId,
                data.vehicle_id,
                data.customer_id,
                userId,
                Number(data.mileage) || 0,
                Number(data.fuel_level) ?? 50,
                data.status || types_1.InspectionStatus.DRAFT,
                data.customer_comment || null,
                data.internal_comment || null,
                now,
                now,
                now,
            ]);
            // Create default checklist items if none supplied (Section 66: Body & Interior)
            const defaultItems = [
                { category: 'body', name: 'Передний бампер и оптика', sort_order: 1 },
                { category: 'body', name: 'Левая сторона (крылья, двери)', sort_order: 2 },
                { category: 'body', name: 'Правая сторона (крылья, двери)', sort_order: 3 },
                { category: 'body', name: 'Задняя часть и багажник', sort_order: 4 },
                { category: 'body', name: 'Крыша и остекление', sort_order: 5 },
                { category: 'interior', name: 'Передние сиденья и ремни', sort_order: 6 },
                { category: 'interior', name: 'Задний ряд сидений', sort_order: 7 },
                { category: 'interior', name: 'Приборная панель и мультимедиа', sort_order: 8 },
            ];
            const itemsToInsert = Array.isArray(data.items) && data.items.length > 0 ? data.items : defaultItems;
            for (const item of itemsToInsert) {
                this.db.run(`INSERT INTO inspection_items (id, inspection_id, category, name, status, comment, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    (0, uuid_1.v4)(),
                    id,
                    item.category || 'general',
                    item.name,
                    item.status || types_1.InspectionItemStatus.NOT_CHECKED,
                    item.comment || null,
                    item.sort_order || 0,
                    now,
                    now,
                ]);
            }
            // Update vehicle current mileage
            if (data.mileage) {
                this.db.run('UPDATE vehicles SET mileage = ?, updated_at = ? WHERE id = ?', [
                    Number(data.mileage),
                    now,
                    data.vehicle_id,
                ]);
            }
            this.ws.emitToOrganization(orgId, 'inspection.updated', { inspectionId: id, status: 'created' });
            return this.getById(orgId, id);
        });
    }
    update(orgId, id, data) {
        const insp = this.getById(orgId, id);
        const now = new Date().toISOString();
        const mileage = data.mileage !== undefined ? Number(data.mileage) : insp.mileage;
        const fuelLevel = data.fuel_level !== undefined ? Number(data.fuel_level) : insp.fuel_level;
        const status = data.status ?? insp.status;
        const customerComment = data.customer_comment !== undefined ? data.customer_comment : insp.customer_comment;
        const internalComment = data.internal_comment !== undefined ? data.internal_comment : insp.internal_comment;
        this.db.run(`UPDATE inspections
       SET mileage = ?, fuel_level = ?, status = ?, customer_comment = ?, internal_comment = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`, [mileage, fuelLevel, status, customerComment, internalComment, now, id, orgId]);
        if (data.mileage) {
            this.db.run('UPDATE vehicles SET mileage = ?, updated_at = ? WHERE id = ?', [
                mileage,
                now,
                insp.vehicle_id,
            ]);
        }
        this.ws.emitToOrganization(orgId, 'inspection.updated', { inspectionId: id, status });
        return this.getById(orgId, id);
    }
    complete(orgId, id) {
        const insp = this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run(`UPDATE inspections SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?`, [now, now, id, orgId]);
        // Create notification
        this.db.run(`INSERT INTO notifications (id, organization_id, user_id, type, title, body, entity_type, entity_id, is_read, created_at)
       VALUES (?, ?, ?, 'inspection.completed', 'Приемка завершена', ?, 'inspection', ?, 0, ?)`, [
            (0, uuid_1.v4)(),
            orgId,
            insp.created_by,
            `Осмотр автомобиля ${insp.vehicle?.make} ${insp.vehicle?.model} (${insp.vehicle?.license_plate}) успешно завершен`,
            id,
            now,
        ]);
        this.ws.emitToOrganization(orgId, 'inspection.updated', { inspectionId: id, status: 'completed' });
        return this.getById(orgId, id);
    }
    cancel(orgId, id) {
        this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run(`UPDATE inspections SET status = 'cancelled', updated_at = ? WHERE id = ? AND organization_id = ?`, [now, id, orgId]);
        this.ws.emitToOrganization(orgId, 'inspection.updated', { inspectionId: id, status: 'cancelled' });
        return this.getById(orgId, id);
    }
    getItems(orgId, inspectionId) {
        this.getById(orgId, inspectionId);
        return this.db.all('SELECT * FROM inspection_items WHERE inspection_id = ? ORDER BY sort_order ASC, created_at ASC', [inspectionId]);
    }
    addItem(orgId, inspectionId, data) {
        this.getById(orgId, inspectionId);
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        this.db.run(`INSERT INTO inspection_items (id, inspection_id, category, name, status, comment, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            inspectionId,
            data.category || 'general',
            data.name,
            data.status || types_1.InspectionItemStatus.NOT_CHECKED,
            data.comment || null,
            Number(data.sort_order) || 0,
            now,
            now,
        ]);
        return this.db.get('SELECT * FROM inspection_items WHERE id = ?', [id]);
    }
    updateItem(orgId, inspectionId, itemId, data) {
        this.getById(orgId, inspectionId);
        const item = this.db.get('SELECT * FROM inspection_items WHERE id = ? AND inspection_id = ?', [itemId, inspectionId]);
        if (!item) {
            throw new common_1.NotFoundException({
                code: 'ITEM_NOT_FOUND',
                message: 'Inspection item not found',
            });
        }
        const now = new Date().toISOString();
        this.db.run(`UPDATE inspection_items
       SET category = ?, name = ?, status = ?, comment = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`, [
            data.category ?? item.category,
            data.name ?? item.name,
            data.status ?? item.status,
            data.comment !== undefined ? data.comment : item.comment,
            data.sort_order !== undefined ? Number(data.sort_order) : item.sort_order,
            now,
            itemId,
        ]);
        return this.db.get('SELECT * FROM inspection_items WHERE id = ?', [itemId]);
    }
};
exports.InspectionsService = InspectionsService;
exports.InspectionsService = InspectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        websocket_gateway_1.AppWebSocketGateway])
], InspectionsService);
//# sourceMappingURL=inspections.service.js.map