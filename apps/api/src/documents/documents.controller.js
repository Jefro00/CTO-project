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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const documents_service_1 = require("./documents.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async getDocuments(user, vehicleId, workOrderId, customerId, type) {
        return this.documentsService.getAll(user.organization_id, {
            vehicle_id: vehicleId,
            work_order_id: workOrderId,
            customer_id: customerId,
            type,
        });
    }
    async generateDocument(user, body) {
        return this.documentsService.generate(user.organization_id, user.id, body);
    }
    async createDocument(user, body) {
        return this.documentsService.create(user.organization_id, user.id, body);
    }
    async getDocument(user, id) {
        return this.documentsService.getById(user.organization_id, id);
    }
    async getDownloadUrl(user, id) {
        const doc = this.documentsService.getById(user.organization_id, id);
        return {
            documentId: doc.id,
            name: doc.name,
            downloadUrl: `/api/v1/documents/${doc.id}`,
        };
    }
    async deleteDocument(user, id) {
        return this.documentsService.delete(user.organization_id, id);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('documents.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List documents (Section 46)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('vehicle_id')),
    __param(2, (0, common_1.Query)('work_order_id')),
    __param(3, (0, common_1.Query)('customer_id')),
    __param(4, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, require_permission_decorator_1.RequirePermission)('documents.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate printable document (Work order, Act, Invoice) (Section 46)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "generateDocument", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('documents.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload/register document (Section 46)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "createDocument", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('documents.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document details (Section 46)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Get)(':id/download-url'),
    (0, require_permission_decorator_1.RequirePermission)('documents.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document download URL (Section 46)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('documents.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete document (Section 46)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "deleteDocument", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('documents'),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map