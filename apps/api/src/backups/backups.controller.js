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
exports.BackupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const backups_service_1 = require("./backups.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
let BackupsController = class BackupsController {
    backupsService;
    constructor(backupsService) {
        this.backupsService = backupsService;
    }
    async getBackups(user) {
        return this.backupsService.getAll(user.organization_id);
    }
    async createBackup(user, body) {
        return this.backupsService.create(user.organization_id, user.id, body?.type);
    }
    async getBackup(user, id) {
        return this.backupsService.getById(user.organization_id, id);
    }
    async restoreBackup(user, id, body) {
        return this.backupsService.restore(user.organization_id, id, body?.confirmationToken);
    }
};
exports.BackupsController = BackupsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('backup.create'),
    (0, swagger_1.ApiOperation)({ summary: 'List backups for organization (Section 52)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BackupsController.prototype, "getBackups", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('backup.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create full organization backup (Section 52 & 77-79)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BackupsController.prototype, "createBackup", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('backup.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Get backup details and manifest (Section 52)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BackupsController.prototype, "getBackup", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, require_permission_decorator_1.RequirePermission)('backup.restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore organization from backup (Section 52)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BackupsController.prototype, "restoreBackup", null);
exports.BackupsController = BackupsController = __decorate([
    (0, swagger_1.ApiTags)('backups'),
    (0, common_1.Controller)('backups'),
    __metadata("design:paramtypes", [backups_service_1.BackupsService])
], BackupsController);
//# sourceMappingURL=backups.controller.js.map