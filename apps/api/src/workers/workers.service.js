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
var BackgroundWorkersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundWorkersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const media_service_1 = require("../media/media.service");
let BackgroundWorkersService = BackgroundWorkersService_1 = class BackgroundWorkersService {
    db;
    mediaService;
    logger = new common_1.Logger(BackgroundWorkersService_1.name);
    constructor(db, mediaService) {
        this.db = db;
        this.mediaService = mediaService;
        this.startWorkers();
    }
    startWorkers() {
        this.logger.log('Starting background workers (Retention, Media, Backups, Notifications)');
        // Run retention cleanup every 10 minutes (Section 76)
        setInterval(() => {
            try {
                const res = this.mediaService.runRetentionCleanup();
                if (res.cleanedCount > 0) {
                    this.logger.log(`Retention worker cleaned ${res.cleanedCount} expired media files`);
                }
            }
            catch (err) {
                this.logger.error('Retention worker error:', err);
            }
        }, 10 * 60 * 1000);
    }
};
exports.BackgroundWorkersService = BackgroundWorkersService;
exports.BackgroundWorkersService = BackgroundWorkersService = BackgroundWorkersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        media_service_1.MediaService])
], BackgroundWorkersService);
//# sourceMappingURL=workers.service.js.map