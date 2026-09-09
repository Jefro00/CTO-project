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
exports.InspectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inspections_service_1 = require("./inspections.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
let InspectionsController = class InspectionsController {
    inspectionsService;
    constructor(inspectionsService) {
        this.inspectionsService = inspectionsService;
    }
    async getInspections(user, page, limit, status, locationId, vehicleId) {
        const locId = user.location_scope === 'all_locations' ? locationId : user.location_id;
        return this.inspectionsService.getAll(user.organization_id, {
            page,
            limit,
            status,
            location_id: locId,
            vehicle_id: vehicleId,
        });
    }
    async createInspection(user, body) {
        return this.inspectionsService.create(user.organization_id, user.id, user.location_id, body);
    }
    async getInspection(user, id) {
        return this.inspectionsService.getById(user.organization_id, id);
    }
    async updateInspection(user, id, body) {
        return this.inspectionsService.update(user.organization_id, id, body);
    }
    async completeInspection(user, id) {
        return this.inspectionsService.complete(user.organization_id, id);
    }
    async cancelInspection(user, id) {
        return this.inspectionsService.cancel(user.organization_id, id);
    }
    async getItems(user, id) {
        return this.inspectionsService.getItems(user.organization_id, id);
    }
    async addItem(user, id, body) {
        return this.inspectionsService.addItem(user.organization_id, id, body);
    }
    async updateItem(user, id, itemId, body) {
        return this.inspectionsService.updateItem(user.organization_id, id, itemId, body);
    }
};
exports.InspectionsController = InspectionsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('inspections.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List inspections (Section 40)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('location_id')),
    __param(5, (0, common_1.Query)('vehicle_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "getInspections", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('inspections.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new inspection (Section 40)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "createInspection", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inspections.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inspection details (Section 40)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "getInspection", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('inspections.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update inspection details (Section 40)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "updateInspection", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, require_permission_decorator_1.RequirePermission)('inspections.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete inspection (Section 40)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "completeInspection", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('inspections.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel inspection (Section 40)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "cancelInspection", null);
__decorate([
    (0, common_1.Get)(':id/items'),
    (0, require_permission_decorator_1.RequirePermission)('inspections.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inspection checklist items (Section 41)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "getItems", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, require_permission_decorator_1.RequirePermission)('inspections.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Add checklist item (Section 41)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)(':id/items/:itemId'),
    (0, require_permission_decorator_1.RequirePermission)('inspections.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update checklist item status/comment (Section 41)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "updateItem", null);
exports.InspectionsController = InspectionsController = __decorate([
    (0, swagger_1.ApiTags)('inspections'),
    (0, common_1.Controller)('inspections'),
    __metadata("design:paramtypes", [inspections_service_1.InspectionsService])
], InspectionsController);
//# sourceMappingURL=inspections.controller.js.map