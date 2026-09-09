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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
let CustomersService = class CustomersService {
    db;
    constructor(db) {
        this.db = db;
    }
    getAll(orgId, query) {
        const page = Math.max(1, Number(query?.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
        const offset = (page - 1) * limit;
        let sql = 'SELECT * FROM customers WHERE organization_id = ? AND deleted_at IS NULL';
        const params = [orgId];
        if (query?.search) {
            sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            const s = `%${query.search.trim()}%`;
            params.push(s, s, s, s);
        }
        const countRow = this.db.get(`SELECT COUNT(*) as total FROM (${sql})`, params);
        const total = countRow?.total || 0;
        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        const customers = this.db.all(sql, params);
        // Attach vehicle counts
        const result = customers.map((c) => {
            const vehicles = this.db.all('SELECT * FROM vehicles WHERE customer_id = ? AND deleted_at IS NULL', [c.id]);
            return {
                ...c,
                vehicles,
            };
        });
        return {
            data: result,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    search(orgId, q) {
        const s = `%${q.trim()}%`;
        const customers = this.db.all(`SELECT * FROM customers
       WHERE organization_id = ? AND deleted_at IS NULL
         AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)
       ORDER BY first_name ASC LIMIT 20`, [orgId, s, s, s, s]);
        return customers.map((c) => {
            const vehicles = this.db.all('SELECT * FROM vehicles WHERE customer_id = ? AND deleted_at IS NULL', [c.id]);
            return {
                ...c,
                vehicles,
            };
        });
    }
    getById(orgId, id) {
        const customer = this.db.get('SELECT * FROM customers WHERE id = ? AND organization_id = ? AND deleted_at IS NULL', [id, orgId]);
        if (!customer) {
            throw new common_1.NotFoundException({
                code: 'CUSTOMER_NOT_FOUND',
                message: 'Customer not found',
            });
        }
        const vehicles = this.db.all('SELECT * FROM vehicles WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC', [id]);
        const workOrders = this.db.all('SELECT * FROM work_orders WHERE customer_id = ? ORDER BY opened_at DESC LIMIT 10', [id]);
        return {
            ...customer,
            vehicles,
            workOrders,
        };
    }
    create(orgId, data) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        this.db.run(`INSERT INTO customers (id, organization_id, first_name, last_name, phone, email, address, notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            orgId,
            data.first_name,
            data.last_name,
            data.phone,
            data.email || null,
            data.address || null,
            data.notes || null,
            data.status || 'active',
            now,
            now,
        ]);
        return this.getById(orgId, id);
    }
    update(orgId, id, data) {
        const customer = this.getById(orgId, id);
        const now = new Date().toISOString();
        const firstName = data.first_name ?? customer.first_name;
        const lastName = data.last_name ?? customer.last_name;
        const phone = data.phone ?? customer.phone;
        const email = data.email !== undefined ? data.email : customer.email;
        const address = data.address !== undefined ? data.address : customer.address;
        const notes = data.notes !== undefined ? data.notes : customer.notes;
        const status = data.status ?? customer.status;
        this.db.run(`UPDATE customers
       SET first_name = ?, last_name = ?, phone = ?, email = ?, address = ?, notes = ?, status = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`, [firstName, lastName, phone, email, address, notes, status, now, id, orgId]);
        return this.getById(orgId, id);
    }
    delete(orgId, id) {
        this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run('UPDATE customers SET deleted_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [now, now, id, orgId]);
        return { success: true, message: 'Customer marked as deleted' };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map