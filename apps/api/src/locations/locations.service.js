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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
let LocationsService = class LocationsService {
    db;
    constructor(db) {
        this.db = db;
    }
    getAll(orgId) {
        return this.db.all('SELECT * FROM locations WHERE organization_id = ? ORDER BY created_at ASC', [orgId]);
    }
    getById(orgId, id) {
        const loc = this.db.get('SELECT * FROM locations WHERE id = ? AND organization_id = ?', [id, orgId]);
        if (!loc) {
            throw new common_1.NotFoundException({
                code: 'LOCATION_NOT_FOUND',
                message: 'Location / Branch not found',
            });
        }
        return loc;
    }
    create(orgId, data) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        this.db.run(`INSERT INTO locations (id, organization_id, name, city, address, phone, email, timezone, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            orgId,
            data.name,
            data.city || null,
            data.address || null,
            data.phone || null,
            data.email || null,
            data.timezone || 'UTC+3',
            data.status || 'active',
            now,
            now,
        ]);
        return this.getById(orgId, id);
    }
    update(orgId, id, data) {
        const loc = this.getById(orgId, id);
        const now = new Date().toISOString();
        const name = data.name ?? loc.name;
        const city = data.city ?? loc.city;
        const address = data.address ?? loc.address;
        const phone = data.phone ?? loc.phone;
        const email = data.email ?? loc.email;
        const timezone = data.timezone ?? loc.timezone;
        const status = data.status ?? loc.status;
        this.db.run(`UPDATE locations
       SET name = ?, city = ?, address = ?, phone = ?, email = ?, timezone = ?, status = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`, [name, city, address, phone, email, timezone, status, now, id, orgId]);
        return this.getById(orgId, id);
    }
    delete(orgId, id) {
        this.getById(orgId, id);
        this.db.run('DELETE FROM locations WHERE id = ? AND organization_id = ?', [id, orgId]);
        return { success: true, message: 'Location deleted successfully' };
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map