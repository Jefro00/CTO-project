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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const database_service_1 = require("../database/database.service");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
let PermissionsController = class PermissionsController {
    db;
    constructor(db) {
        this.db = db;
    }
    async getPermissions() {
        return this.db.all('SELECT * FROM permissions ORDER BY code ASC');
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('roles.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List all system permissions (Section 12)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getPermissions", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, swagger_1.ApiTags)('permissions'),
    (0, common_1.Controller)('permissions'),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map