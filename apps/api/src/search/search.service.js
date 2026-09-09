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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let SearchService = class SearchService {
    db;
    constructor(db) {
        this.db = db;
    }
    search(orgId, q) {
        if (!q || !q.trim()) {
            return {
                vehicles: [],
                customers: [],
                workOrders: [],
                documents: [],
            };
        }
        const s = `%${q.trim()}%`;
        // 1. Vehicles
        const vehicles = this.db.all(`SELECT v.*, c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone
       FROM vehicles v
       JOIN customers c ON v.customer_id = c.id
       WHERE v.organization_id = ? AND v.deleted_at IS NULL
         AND (
           LOWER(v.vin) LIKE LOWER(?) OR
           LOWER(v.license_plate) LIKE LOWER(?) OR
           LOWER(v.make) LIKE LOWER(?) OR
           LOWER(v.model) LIKE LOWER(?)
         )
       LIMIT 10`, [orgId, s, s, s, s]);
        // 2. Customers
        const customers = this.db.all(`SELECT * FROM customers
       WHERE organization_id = ? AND deleted_at IS NULL
         AND (
           LOWER(first_name) LIKE LOWER(?) OR
           LOWER(last_name) LIKE LOWER(?) OR
           phone LIKE ? OR
           LOWER(email) LIKE LOWER(?)
         )
       LIMIT 10`, [orgId, s, s, s, s]);
        // 3. Work Orders
        const workOrders = this.db.all(`SELECT w.*, v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate,
              c.first_name as customer_first_name, c.last_name as customer_last_name
       FROM work_orders w
       JOIN vehicles v ON w.vehicle_id = v.id
       JOIN customers c ON w.customer_id = c.id
       WHERE w.organization_id = ?
         AND (
           w.number LIKE ? OR
           LOWER(w.customer_complaint) LIKE LOWER(?) OR
           LOWER(w.diagnosis) LIKE LOWER(?) OR
           LOWER(v.license_plate) LIKE LOWER(?)
         )
       LIMIT 10`, [orgId, s, s, s, s]);
        // 4. Documents
        const documents = this.db.all(`SELECT d.*, v.license_plate as vehicle_plate, c.first_name as customer_first_name, c.last_name as customer_last_name
       FROM documents d
       JOIN vehicles v ON d.vehicle_id = v.id
       JOIN customers c ON d.customer_id = c.id
       WHERE d.organization_id = ? AND d.deleted_at IS NULL
         AND (
           LOWER(d.name) LIKE LOWER(?) OR
           LOWER(d.type) LIKE LOWER(?) OR
           LOWER(v.license_plate) LIKE LOWER(?)
         )
       LIMIT 10`, [orgId, s, s, s]);
        return {
            vehicles: vehicles.map((v) => ({
                ...v,
                customer: {
                    id: v.customer_id,
                    first_name: v.customer_first_name,
                    last_name: v.customer_last_name,
                    phone: v.customer_phone,
                },
            })),
            customers,
            workOrders: workOrders.map((w) => ({
                ...w,
                vehicle: {
                    id: w.vehicle_id,
                    make: w.vehicle_make,
                    model: w.vehicle_model,
                    license_plate: w.vehicle_plate,
                },
                customer: {
                    id: w.customer_id,
                    first_name: w.customer_first_name,
                    last_name: w.customer_last_name,
                },
            })),
            documents,
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SearchService);
//# sourceMappingURL=search.service.js.map