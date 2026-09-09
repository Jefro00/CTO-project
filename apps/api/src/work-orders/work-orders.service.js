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
exports.WorkOrdersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const types_1 = require("@automotive-os/types");
let WorkOrdersService = class WorkOrdersService {
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
      SELECT w.*,
             v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate, v.vin as vehicle_vin,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone,
             u.first_name as advisor_first_name, u.last_name as advisor_last_name,
             m.first_name as master_first_name, m.last_name as master_last_name,
             l.name as location_name
      FROM work_orders w
      JOIN vehicles v ON w.vehicle_id = v.id
      JOIN customers c ON w.customer_id = c.id
      JOIN users u ON w.advisor_id = u.id
      LEFT JOIN users m ON w.master_id = m.id
      JOIN locations l ON w.location_id = l.id
      WHERE w.organization_id = ?
    `;
        const params = [orgId];
        if (query?.status) {
            sql += ' AND w.status = ?';
            params.push(query.status);
        }
        if (query?.location_id) {
            sql += ' AND w.location_id = ?';
            params.push(query.location_id);
        }
        if (query?.vehicle_id) {
            sql += ' AND w.vehicle_id = ?';
            params.push(query.vehicle_id);
        }
        if (query?.customer_id) {
            sql += ' AND w.customer_id = ?';
            params.push(query.customer_id);
        }
        if (query?.search) {
            sql += ` AND (
        w.number LIKE ? OR
        LOWER(v.make) LIKE LOWER(?) OR
        LOWER(v.model) LIKE LOWER(?) OR
        LOWER(v.license_plate) LIKE LOWER(?) OR
        LOWER(c.first_name) LIKE LOWER(?) OR
        LOWER(c.last_name) LIKE LOWER(?)
      )`;
            const s = `%${query.search.trim()}%`;
            params.push(s, s, s, s, s, s);
        }
        const countRow = this.db.get(`SELECT COUNT(*) as total FROM (${sql})`, params);
        const total = countRow?.total || 0;
        sql += ' ORDER BY w.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        const rows = this.db.all(sql, params);
        const data = rows.map((w) => {
            const items = this.db.all('SELECT * FROM work_order_items WHERE work_order_id = ?', [w.id]);
            return {
                ...w,
                items,
                vehicle: {
                    id: w.vehicle_id,
                    make: w.vehicle_make,
                    model: w.vehicle_model,
                    license_plate: w.vehicle_plate,
                    vin: w.vehicle_vin,
                },
                customer: {
                    id: w.customer_id,
                    first_name: w.customer_first_name,
                    last_name: w.customer_last_name,
                    phone: w.customer_phone,
                },
                advisor: {
                    id: w.advisor_id,
                    first_name: w.advisor_first_name,
                    last_name: w.advisor_last_name,
                },
                master: w.master_id
                    ? {
                        id: w.master_id,
                        first_name: w.master_first_name,
                        last_name: w.master_last_name,
                    }
                    : null,
                location: {
                    id: w.location_id,
                    name: w.location_name,
                },
            };
        });
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
        const w = this.db.get(`SELECT w.*,
             v.make as vehicle_make, v.model as vehicle_model, v.year as vehicle_year, v.license_plate as vehicle_plate, v.vin as vehicle_vin,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone, c.email as customer_email,
             u.first_name as advisor_first_name, u.last_name as advisor_last_name,
             m.first_name as master_first_name, m.last_name as master_last_name,
             l.name as location_name
      FROM work_orders w
      JOIN vehicles v ON w.vehicle_id = v.id
      JOIN customers c ON w.customer_id = c.id
      JOIN users u ON w.advisor_id = u.id
      LEFT JOIN users m ON w.master_id = m.id
      JOIN locations l ON w.location_id = l.id
      WHERE w.id = ? AND w.organization_id = ?`, [id, orgId]);
        if (!w) {
            throw new common_1.NotFoundException({
                code: 'WORK_ORDER_NOT_FOUND',
                message: 'Work order not found',
            });
        }
        const items = this.db.all(`SELECT i.*, u.first_name as assignee_first_name, u.last_name as assignee_last_name
       FROM work_order_items i
       LEFT JOIN users u ON i.assigned_to = u.id
       WHERE i.work_order_id = ?
       ORDER BY i.created_at ASC`, [id]);
        const documents = this.db.all('SELECT * FROM documents WHERE work_order_id = ? AND deleted_at IS NULL', [id]);
        const media = this.db.all('SELECT * FROM media WHERE work_order_id = ? AND deleted_at IS NULL', [id]);
        const tasks = this.db.all('SELECT * FROM tasks WHERE work_order_id = ?', [id]);
        return {
            ...w,
            items: items.map((it) => ({
                ...it,
                assignee: it.assigned_to
                    ? {
                        id: it.assigned_to,
                        first_name: it.assignee_first_name,
                        last_name: it.assignee_last_name,
                    }
                    : null,
            })),
            documents,
            media,
            tasks,
            vehicle: {
                id: w.vehicle_id,
                make: w.vehicle_make,
                model: w.vehicle_model,
                year: w.vehicle_year,
                license_plate: w.vehicle_plate,
                vin: w.vehicle_vin,
            },
            customer: {
                id: w.customer_id,
                first_name: w.customer_first_name,
                last_name: w.customer_last_name,
                phone: w.customer_phone,
                email: w.customer_email,
            },
            advisor: {
                id: w.advisor_id,
                first_name: w.advisor_first_name,
                last_name: w.advisor_last_name,
            },
            master: w.master_id
                ? {
                    id: w.master_id,
                    first_name: w.master_first_name,
                    last_name: w.master_last_name,
                }
                : null,
            location: {
                id: w.location_id,
                name: w.location_name,
            },
        };
    }
    create(orgId, advisorId, userLocationId, data) {
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
                message: 'Location is required',
            });
        }
        return this.db.transaction(() => {
            // Generate sequential order number (e.g. 1824, 1825...)
            const countRow = this.db.get('SELECT COUNT(*) as count FROM work_orders WHERE organization_id = ?', [orgId]);
            const seq = 1824 + (countRow?.count || 0);
            const number = data.number || String(seq);
            let subtotal = 0;
            const discount = Number(data.discount) || 0;
            const taxRate = Number(data.tax_rate) || 0; // percentage if applicable
            this.db.run(`INSERT INTO work_orders (
          id, organization_id, location_id, vehicle_id, customer_id, inspection_id,
          advisor_id, master_id, number, status, customer_complaint, diagnosis,
          mileage_in, subtotal, discount, tax, total, opened_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id,
                orgId,
                locationId,
                data.vehicle_id,
                data.customer_id,
                data.inspection_id || null,
                advisorId,
                data.master_id || null,
                number,
                data.status || types_1.WorkOrderStatus.DRAFT,
                data.customer_complaint || null,
                data.diagnosis || null,
                Number(data.mileage_in) || 0,
                0,
                discount,
                0,
                0,
                now,
                now,
                now,
            ]);
            // Add items if provided
            if (Array.isArray(data.items)) {
                for (const item of data.items) {
                    const itemId = (0, uuid_1.v4)();
                    const q = Number(item.quantity) || 1;
                    const p = Number(item.unit_price) || 0;
                    const cost = item.cost_price ? Number(item.cost_price) : null;
                    const totalP = q * p;
                    subtotal += totalP;
                    this.db.run(`INSERT INTO work_order_items (
              id, work_order_id, type, description, quantity, unit_price, cost_price, total_price, assigned_to, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`, [
                        itemId,
                        id,
                        item.type || types_1.WorkOrderItemType.LABOR,
                        item.description,
                        q,
                        p,
                        cost,
                        totalP,
                        item.assigned_to || data.master_id || null,
                        now,
                        now,
                    ]);
                }
            }
            const total = Math.max(0, subtotal - discount + (subtotal * taxRate) / 100);
            this.db.run('UPDATE work_orders SET subtotal = ?, total = ? WHERE id = ?', [subtotal, total, id]);
            // Link inspection to this work order
            if (data.inspection_id) {
                this.db.run('UPDATE inspections SET status = ? WHERE id = ?', [
                    types_1.InspectionStatus.COMPLETED,
                    data.inspection_id,
                ]);
            }
            if (data.master_id) {
                this.db.run(`INSERT INTO notifications (id, organization_id, user_id, type, title, body, entity_type, entity_id, is_read, created_at)
           VALUES (?, ?, ?, 'work_order.assigned', 'Назначен заказ-наряд', ?, 'work_order', ?, 0, ?)`, [(0, uuid_1.v4)(), orgId, data.master_id, `Вам назначен заказ-наряд #${number}`, id, now]);
                this.ws.emitToUser(data.master_id, 'notification.created', { title: 'Назначен заказ-наряд', body: `Заказ #${number}` });
            }
            this.ws.emitToOrganization(orgId, 'work_order.updated', { workOrderId: id, status: data.status || 'draft' });
            return this.getById(orgId, id);
        });
    }
    update(orgId, id, data) {
        const wo = this.getById(orgId, id);
        const now = new Date().toISOString();
        const status = data.status ?? wo.status;
        const complaint = data.customer_complaint !== undefined ? data.customer_complaint : wo.customer_complaint;
        const diagnosis = data.diagnosis !== undefined ? data.diagnosis : wo.diagnosis;
        const mileageIn = data.mileage_in !== undefined ? Number(data.mileage_in) : wo.mileage_in;
        const mileageOut = data.mileage_out !== undefined ? Number(data.mileage_out) : wo.mileage_out;
        const masterId = data.master_id !== undefined ? data.master_id : wo.master_id;
        const discount = data.discount !== undefined ? Number(data.discount) : wo.discount;
        this.db.run(`UPDATE work_orders
       SET status = ?, customer_complaint = ?, diagnosis = ?, mileage_in = ?, mileage_out = ?, master_id = ?, discount = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`, [status, complaint, diagnosis, mileageIn, mileageOut, masterId, discount, now, id, orgId]);
        this.recalculateTotal(id);
        this.ws.emitToOrganization(orgId, 'work_order.updated', { workOrderId: id, status });
        return this.getById(orgId, id);
    }
    approve(orgId, id) {
        const wo = this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run(`UPDATE work_orders SET status = 'approved', updated_at = ? WHERE id = ? AND organization_id = ?`, [now, id, orgId]);
        this.ws.emitToOrganization(orgId, 'work_order.updated', { workOrderId: id, status: 'approved' });
        return this.getById(orgId, id);
    }
    start(orgId, id) {
        const wo = this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run(`UPDATE work_orders SET status = 'in_progress', updated_at = ? WHERE id = ? AND organization_id = ?`, [now, id, orgId]);
        this.ws.emitToOrganization(orgId, 'work_order.updated', { workOrderId: id, status: 'in_progress' });
        return this.getById(orgId, id);
    }
    complete(orgId, id) {
        const wo = this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run(`UPDATE work_orders SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?`, [now, now, id, orgId]);
        this.ws.emitToOrganization(orgId, 'work_order.updated', { workOrderId: id, status: 'completed' });
        return this.getById(orgId, id);
    }
    close(orgId, id) {
        const wo = this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run(`UPDATE work_orders SET status = 'closed', closed_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?`, [now, now, id, orgId]);
        // Update vehicle mileage if mileage_out was specified
        if (wo.mileage_out || wo.mileage_in) {
            const finalMileage = wo.mileage_out || wo.mileage_in;
            this.db.run('UPDATE vehicles SET mileage = ?, updated_at = ? WHERE id = ?', [
                finalMileage,
                now,
                wo.vehicle_id,
            ]);
        }
        // Record audit log (Section 83)
        this.db.run(`INSERT INTO audit_logs (id, organization_id, location_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, 'close', 'work_orders', ?, null, '{"status":"closed"}', '127.0.0.1', 'API', ?)`, [(0, uuid_1.v4)(), orgId, wo.location_id, wo.advisor_id, id, now]);
        this.ws.emitToOrganization(orgId, 'work_order.updated', { workOrderId: id, status: 'closed' });
        return this.getById(orgId, id);
    }
    cancel(orgId, id) {
        this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run(`UPDATE work_orders SET status = 'cancelled', updated_at = ? WHERE id = ? AND organization_id = ?`, [now, id, orgId]);
        this.ws.emitToOrganization(orgId, 'work_order.updated', { workOrderId: id, status: 'cancelled' });
        return this.getById(orgId, id);
    }
    // Items
    getItems(orgId, workOrderId) {
        this.getById(orgId, workOrderId);
        return this.db.all(`SELECT i.*, u.first_name as assignee_first_name, u.last_name as assignee_last_name
       FROM work_order_items i
       LEFT JOIN users u ON i.assigned_to = u.id
       WHERE i.work_order_id = ? ORDER BY i.created_at ASC`, [workOrderId]);
    }
    addItem(orgId, workOrderId, data) {
        this.getById(orgId, workOrderId);
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const q = Number(data.quantity) || 1;
        const p = Number(data.unit_price) || 0;
        const totalP = q * p;
        this.db.run(`INSERT INTO work_order_items (id, work_order_id, type, description, quantity, unit_price, cost_price, total_price, assigned_to, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            workOrderId,
            data.type || types_1.WorkOrderItemType.LABOR,
            data.description,
            q,
            p,
            data.cost_price ? Number(data.cost_price) : null,
            totalP,
            data.assigned_to || null,
            data.status || 'pending',
            now,
            now,
        ]);
        this.recalculateTotal(workOrderId);
        return this.db.get('SELECT * FROM work_order_items WHERE id = ?', [id]);
    }
    updateItem(orgId, workOrderId, itemId, data) {
        this.getById(orgId, workOrderId);
        const item = this.db.get('SELECT * FROM work_order_items WHERE id = ? AND work_order_id = ?', [
            itemId,
            workOrderId,
        ]);
        if (!item) {
            throw new common_1.NotFoundException({ code: 'ITEM_NOT_FOUND', message: 'Work order item not found' });
        }
        const now = new Date().toISOString();
        const q = data.quantity !== undefined ? Number(data.quantity) : item.quantity;
        const p = data.unit_price !== undefined ? Number(data.unit_price) : item.unit_price;
        const totalP = q * p;
        this.db.run(`UPDATE work_order_items
       SET type = ?, description = ?, quantity = ?, unit_price = ?, cost_price = ?, total_price = ?, assigned_to = ?, status = ?, updated_at = ?
       WHERE id = ?`, [
            data.type ?? item.type,
            data.description ?? item.description,
            q,
            p,
            data.cost_price !== undefined ? Number(data.cost_price) : item.cost_price,
            totalP,
            data.assigned_to !== undefined ? data.assigned_to : item.assigned_to,
            data.status ?? item.status,
            now,
            itemId,
        ]);
        this.recalculateTotal(workOrderId);
        return this.db.get('SELECT * FROM work_order_items WHERE id = ?', [itemId]);
    }
    deleteItem(orgId, workOrderId, itemId) {
        this.getById(orgId, workOrderId);
        this.db.run('DELETE FROM work_order_items WHERE id = ? AND work_order_id = ?', [itemId, workOrderId]);
        this.recalculateTotal(workOrderId);
        return { success: true, message: 'Item deleted' };
    }
    recalculateTotal(workOrderId) {
        const sumRow = this.db.get('SELECT SUM(total_price) as subtotal FROM work_order_items WHERE work_order_id = ?', [workOrderId]);
        const wo = this.db.get('SELECT discount, tax FROM work_orders WHERE id = ?', [workOrderId]);
        const subtotal = sumRow?.subtotal || 0;
        const discount = wo?.discount || 0;
        const tax = wo?.tax || 0;
        const total = Math.max(0, subtotal - discount + tax);
        this.db.run('UPDATE work_orders SET subtotal = ?, total = ? WHERE id = ?', [
            subtotal,
            total,
            workOrderId,
        ]);
    }
};
exports.WorkOrdersService = WorkOrdersService;
exports.WorkOrdersService = WorkOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        websocket_gateway_1.AppWebSocketGateway])
], WorkOrdersService);
//# sourceMappingURL=work-orders.service.js.map