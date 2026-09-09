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
exports.WorkOrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const work_orders_service_1 = require("./work-orders.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
let WorkOrdersController = class WorkOrdersController {
    workOrdersService;
    constructor(workOrdersService) {
        this.workOrdersService = workOrdersService;
    }
    async getWorkOrders(user, page, limit, status, locationId, vehicleId, customerId, search) {
        const locId = user.location_scope === 'all_locations' ? locationId : user.location_id;
        return this.workOrdersService.getAll(user.organization_id, {
            page,
            limit,
            status,
            location_id: locId,
            vehicle_id: vehicleId,
            customer_id: customerId,
            search,
        });
    }
    async createWorkOrder(user, body) {
        return this.workOrdersService.create(user.organization_id, user.id, user.location_id, body);
    }
    async getWorkOrder(user, id) {
        return this.workOrdersService.getById(user.organization_id, id);
    }
    async updateWorkOrder(user, id, body) {
        return this.workOrdersService.update(user.organization_id, id, body);
    }
    async approveWorkOrder(user, id) {
        return this.workOrdersService.approve(user.organization_id, id);
    }
    async startWorkOrder(user, id) {
        return this.workOrdersService.start(user.organization_id, id);
    }
    async completeWorkOrder(user, id) {
        return this.workOrdersService.complete(user.organization_id, id);
    }
    async closeWorkOrder(user, id) {
        return this.workOrdersService.close(user.organization_id, id);
    }
    async cancelWorkOrder(user, id) {
        return this.workOrdersService.cancel(user.organization_id, id);
    }
    async getItems(user, id) {
        return this.workOrdersService.getItems(user.organization_id, id);
    }
    async addItem(user, id, body) {
        return this.workOrdersService.addItem(user.organization_id, id, body);
    }
    async updateItem(user, id, itemId, body) {
        return this.workOrdersService.updateItem(user.organization_id, id, itemId, body);
    }
    async deleteItem(user, id, itemId) {
        return this.workOrdersService.deleteItem(user.organization_id, id, itemId);
    }
};
exports.WorkOrdersController = WorkOrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('work_orders.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List work orders (Section 44)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('location_id')),
    __param(5, (0, common_1.Query)('vehicle_id')),
    __param(6, (0, common_1.Query)('customer_id')),
    __param(7, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "getWorkOrders", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('work_orders.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new work order (Section 44)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "createWorkOrder", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('work_orders.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get work order details with items (Section 44)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "getWorkOrder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('work_orders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update work order (Section 44)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "updateWorkOrder", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, require_permission_decorator_1.RequirePermission)('work_orders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve work order (Section 44)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "approveWorkOrder", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, require_permission_decorator_1.RequirePermission)('work_orders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Start work on work order (Section 44)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "startWorkOrder", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, require_permission_decorator_1.RequirePermission)('work_orders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete work order (Section 44)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "completeWorkOrder", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, require_permission_decorator_1.RequirePermission)('work_orders.close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close and finalize work order (Section 44)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "closeWorkOrder", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permission_decorator_1.RequirePermission)('work_orders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel work order (Section 44)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "cancelWorkOrder", null);
__decorate([
    (0, common_1.Get)(':id/items'),
    (0, require_permission_decorator_1.RequirePermission)('work_order_items.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get work order items (Section 45)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "getItems", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, require_permission_decorator_1.RequirePermission)('work_order_items.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Add item (labor or part) to work order (Section 45)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)(':id/items/:itemId'),
    (0, require_permission_decorator_1.RequirePermission)('work_order_items.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update work order item (Section 45)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/:itemId'),
    (0, require_permission_decorator_1.RequirePermission)('work_order_items.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete work order item (Section 45)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "deleteItem", null);
exports.WorkOrdersController = WorkOrdersController = __decorate([
    (0, swagger_1.ApiTags)('work-orders'),
    (0, common_1.Controller)('work-orders'),
    __metadata("design:paramtypes", [work_orders_service_1.WorkOrdersService])
], WorkOrdersController);
//# sourceMappingURL=work-orders.controller.js.map