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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicles_service_1 = require("./vehicles.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
let VehiclesController = class VehiclesController {
    vehiclesService;
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
    }
    async searchVehicles(user, q) {
        return this.vehiclesService.search(user.organization_id, q || '');
    }
    async getVehicleHistory(user, id, page, limit) {
        return this.vehiclesService.getHistory(user.organization_id, id, { page, limit });
    }
    async getVehicles(user, page, limit, make, model, year, licensePlate, vin, status, search) {
        return this.vehiclesService.getAll(user.organization_id, {
            page,
            limit,
            make,
            model,
            year,
            license_plate: licensePlate,
            vin,
            status,
            search,
        });
    }
    async createVehicle(user, body) {
        return this.vehiclesService.create(user.organization_id, body);
    }
    async getVehicle(user, id) {
        return this.vehiclesService.getById(user.organization_id, id);
    }
    async updateVehicle(user, id, body) {
        return this.vehiclesService.update(user.organization_id, id, body);
    }
    async deleteVehicle(user, id) {
        return this.vehiclesService.delete(user.organization_id, id);
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Get)('search'),
    (0, require_permission_decorator_1.RequirePermission)('vehicles.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Search vehicles by VIN, license plate, customer phone or name (Section 38)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "searchVehicles", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, require_permission_decorator_1.RequirePermission)('vehicles.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get aggregated vehicle timeline history (Section 39)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "getVehicleHistory", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('vehicles.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List vehicles with pagination & filtering (Section 38 & 57)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('make')),
    __param(4, (0, common_1.Query)('model')),
    __param(5, (0, common_1.Query)('year')),
    __param(6, (0, common_1.Query)('license_plate')),
    __param(7, (0, common_1.Query)('vin')),
    __param(8, (0, common_1.Query)('status')),
    __param(9, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "getVehicles", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('vehicles.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Register new vehicle (Section 38)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "createVehicle", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('vehicles.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicle details (Section 38)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "getVehicle", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('vehicles.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update vehicle information (Section 38)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "updateVehicle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('vehicles.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete vehicle (Section 38)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "deleteVehicle", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, swagger_1.ApiTags)('vehicles'),
    (0, common_1.Controller)('vehicles'),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService])
], VehiclesController);
//# sourceMappingURL=vehicles.controller.js.map