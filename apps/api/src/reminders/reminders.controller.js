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
exports.RemindersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reminders_service_1 = require("./reminders.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
let RemindersController = class RemindersController {
    remindersService;
    constructor(remindersService) {
        this.remindersService = remindersService;
    }
    async getReminders(user, vehicleId, customerId, status) {
        return this.remindersService.getAll(user.organization_id, {
            vehicle_id: vehicleId,
            customer_id: customerId,
            status,
        });
    }
    async createReminder(user, body) {
        return this.remindersService.create(user.organization_id, user.id, user.location_id, body);
    }
    async getReminder(user, id) {
        return this.remindersService.getById(user.organization_id, id);
    }
    async updateReminder(user, id, body) {
        return this.remindersService.update(user.organization_id, id, body);
    }
    async completeReminder(user, id) {
        return this.remindersService.complete(user.organization_id, id);
    }
};
exports.RemindersController = RemindersController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('reminders.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List maintenance reminders (Section 48)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('vehicle_id')),
    __param(2, (0, common_1.Query)('customer_id')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "getReminders", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('reminders.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create maintenance reminder (Section 48)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "createReminder", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('reminders.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reminder details (Section 48)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "getReminder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('reminders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update reminder (Section 48)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "updateReminder", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, require_permission_decorator_1.RequirePermission)('reminders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark reminder completed (Section 48)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "completeReminder", null);
exports.RemindersController = RemindersController = __decorate([
    (0, swagger_1.ApiTags)('reminders'),
    (0, common_1.Controller)('reminders'),
    __metadata("design:paramtypes", [reminders_service_1.RemindersService])
], RemindersController);
//# sourceMappingURL=reminders.controller.js.map