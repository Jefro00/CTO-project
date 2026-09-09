"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const config_1 = require("@automotive-os/config");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let MediaService = class MediaService {
    db;
    ws;
    uploadDir;
    constructor(db, ws) {
        this.db = db;
        this.ws = ws;
        this.uploadDir = path.resolve(process.cwd(), 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    generateUploadUrl(orgId, userId, userLocationId, data) {
        // Validate file size (Section 85)
        let type = 'photo';
        if (data.mimeType.startsWith('video/')) {
            type = 'video';
            if (data.size > config_1.APP_CONFIG.MAX_FILE_SIZES.VIDEO) {
                throw new common_1.BadRequestException({
                    code: 'FILE_TOO_LARGE',
                    message: `Video size exceeds max allowed ${config_1.APP_CONFIG.MAX_FILE_SIZES.VIDEO / 1024 / 1024}MB`,
                });
            }
        }
        else if (data.mimeType.startsWith('image/')) {
            type = 'photo';
            if (data.size > config_1.APP_CONFIG.MAX_FILE_SIZES.PHOTO) {
                throw new common_1.BadRequestException({
                    code: 'FILE_TOO_LARGE',
                    message: `Photo size exceeds max allowed ${config_1.APP_CONFIG.MAX_FILE_SIZES.PHOTO / 1024 / 1024}MB`,
                });
            }
        }
        else {
            type = 'document_preview';
        }
        const mediaId = (0, uuid_1.v4)();
        const locationId = data.locationId || userLocationId || 'default';
        const storageKey = `organizations/${orgId}/media/${type}s/${mediaId}-${path.basename(data.fileName)}`;
        const now = new Date().toISOString();
        let vehicleId = data.vehicleId;
        let customerId = null;
        let inspectionId = data.entityType === 'inspection' ? data.entityId : null;
        let workOrderId = data.entityType === 'work_order' ? data.entityId : null;
        if (inspectionId) {
            const insp = this.db.get('SELECT vehicle_id, customer_id, location_id FROM inspections WHERE id = ?', [inspectionId]);
            if (insp) {
                vehicleId = insp.vehicle_id;
                customerId = insp.customer_id;
            }
        }
        else if (workOrderId) {
            const wo = this.db.get('SELECT vehicle_id, customer_id, location_id FROM work_orders WHERE id = ?', [workOrderId]);
            if (wo) {
                vehicleId = wo.vehicle_id;
                customerId = wo.customer_id;
            }
        }
        else if (data.entityType === 'vehicle') {
            vehicleId = data.entityId;
            const v = this.db.get('SELECT customer_id FROM vehicles WHERE id = ?', [vehicleId]);
            if (v)
                customerId = v.customer_id;
        }
        const checksum = crypto.createHash('sha256').update(`${mediaId}-${data.fileName}`).digest('hex');
        this.db.run(`INSERT INTO media (
        id, organization_id, location_id, vehicle_id, customer_id, inspection_id, work_order_id,
        uploaded_by, type, storage_key, mime_type, file_name, file_size, checksum, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`, [
            mediaId,
            orgId,
            locationId,
            vehicleId || 'unknown',
            customerId,
            inspectionId,
            workOrderId,
            userId,
            type,
            storageKey,
            data.mimeType,
            data.fileName,
            data.size,
            checksum,
            now,
        ]);
        // Presigned upload URL
        const uploadUrl = `/api/v1/media/${mediaId}/direct-upload`;
        return {
            mediaId,
            uploadUrl,
            storageKey,
        };
    }
    completeUpload(orgId, id, data) {
        const media = this.getById(orgId, id);
        const now = new Date().toISOString();
        let metadataStr = media.metadata ? JSON.stringify(media.metadata) : null;
        if (data?.damage_markers || data?.width || data?.height) {
            metadataStr = JSON.stringify({
                damage_markers: data.damage_markers || [],
                width: data.width,
                height: data.height,
            });
        }
        this.db.run(`UPDATE media SET status = 'ready', duration = ?, metadata = ? WHERE id = ? AND organization_id = ?`, [data?.duration ?? media.duration, metadataStr, id, orgId]);
        this.ws.emitToOrganization(orgId, 'media.processed', { mediaId: id, status: 'ready' });
        return this.getById(orgId, id);
    }
    getById(orgId, id) {
        const m = this.db.get(`SELECT m.*, u.first_name, u.last_name
       FROM media m
       JOIN users u ON m.uploaded_by = u.id
       WHERE m.id = ? AND m.organization_id = ? AND m.deleted_at IS NULL`, [id, orgId]);
        if (!m) {
            throw new common_1.NotFoundException({
                code: 'MEDIA_NOT_FOUND',
                message: 'Media file not found or deleted',
            });
        }
        return {
            ...m,
            metadata: m.metadata ? JSON.parse(m.metadata) : null,
            download_url: `/api/v1/media/${m.id}/download-url`,
        };
    }
    getDownloadUrl(orgId, id) {
        const m = this.getById(orgId, id);
        const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
        return {
            mediaId: m.id,
            fileName: m.file_name,
            mimeType: m.mime_type,
            url: `/api/v1/media/${m.id}/stream?token=${Buffer.from(m.id).toString('base64')}`,
            expiresAt,
        };
    }
    delete(orgId, id) {
        const m = this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run('UPDATE media SET deleted_at = ? WHERE id = ? AND organization_id = ?', [now, id, orgId]);
        return { success: true, message: 'Media deleted' };
    }
    // Retention cleanup worker (Section 76)
    runRetentionCleanup() {
        const now = new Date().toISOString();
        const rows = this.db.all(`SELECT id FROM media WHERE retention_until IS NOT NULL AND retention_until < ? AND legal_hold = 0 AND deleted_at IS NULL`, [now]);
        for (const r of rows) {
            this.db.run('UPDATE media SET deleted_at = ?, archived_at = ? WHERE id = ?', [now, now, r.id]);
        }
        return { cleanedCount: rows.length };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        websocket_gateway_1.AppWebSocketGateway])
], MediaService);
//# sourceMappingURL=media.service.js.map