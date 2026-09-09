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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const media_service_1 = require("./media.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async generateUploadUrl(user, body) {
        return this.mediaService.generateUploadUrl(user.organization_id, user.id, user.location_id, body);
    }
    async completeUpload(user, id, body) {
        return this.mediaService.completeUpload(user.organization_id, id, body);
    }
    async getMedia(user, id) {
        return this.mediaService.getById(user.organization_id, id);
    }
    async getDownloadUrl(user, id) {
        return this.mediaService.getDownloadUrl(user.organization_id, id);
    }
    async deleteMedia(user, id) {
        return this.mediaService.delete(user.organization_id, id);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload-url'),
    (0, require_permission_decorator_1.RequirePermission)('media.upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate presigned upload URL (Section 42)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "generateUploadUrl", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, require_permission_decorator_1.RequirePermission)('media.upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete media upload and attach metadata/damage markers (Section 42 & 67)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "completeUpload", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('media.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get media metadata (Section 43)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getMedia", null);
__decorate([
    (0, common_1.Get)(':id/download-url'),
    (0, require_permission_decorator_1.RequirePermission)('media.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get temporary download URL (Section 43)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('media.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete media (Section 43)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteMedia", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('media'),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map