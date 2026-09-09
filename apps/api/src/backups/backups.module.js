"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupsModule = void 0;
const common_1 = require("@nestjs/common");
const backups_service_1 = require("./backups.service");
const backups_controller_1 = require("./backups.controller");
let BackupsModule = class BackupsModule {
};
exports.BackupsModule = BackupsModule;
exports.BackupsModule = BackupsModule = __decorate([
    (0, common_1.Module)({
        controllers: [backups_controller_1.BackupsController],
        providers: [backups_service_1.BackupsService],
        exports: [backups_service_1.BackupsService],
    })
], BackupsModule);
//# sourceMappingURL=backups.module.js.map