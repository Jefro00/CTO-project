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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let OrganizationsService = class OrganizationsService {
    db;
    constructor(db) {
        this.db = db;
    }
    getOrganization(orgId) {
        const org = this.db.get('SELECT * FROM organizations WHERE id = ?', [orgId]);
        if (!org) {
            throw new common_1.NotFoundException({
                code: 'ORGANIZATION_NOT_FOUND',
                message: 'Organization not found',
            });
        }
        return org;
    }
    updateOrganization(orgId, data) {
        const org = this.getOrganization(orgId);
        const now = new Date().toISOString();
        const name = data.name ?? org.name;
        const legal_name = data.legal_name ?? org.legal_name;
        const tax_id = data.tax_id ?? org.tax_id;
        const phone = data.phone ?? org.phone;
        const email = data.email ?? org.email;
        const address = data.address ?? org.address;
        const logo_url = data.logo_url ?? org.logo_url;
        const timezone = data.timezone ?? org.timezone;
        const currency = data.currency ?? org.currency;
        const status = data.status ?? org.status;
        this.db.run(`UPDATE organizations
       SET name = ?, legal_name = ?, tax_id = ?, phone = ?, email = ?, address = ?, logo_url = ?, timezone = ?, currency = ?, status = ?, updated_at = ?
       WHERE id = ?`, [name, legal_name, tax_id, phone, email, address, logo_url, timezone, currency, status, now, orgId]);
        return this.getOrganization(orgId);
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map