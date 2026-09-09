import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { APP_CONFIG } from '@automotive-os/config';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class MediaService {
  private uploadDir: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly ws: AppWebSocketGateway,
  ) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  generateUploadUrl(
    orgId: string,
    userId: string,
    userLocationId: string | null,
    data: {
      fileName: string;
      mimeType: string;
      size: number;
      entityType: 'inspection' | 'work_order' | 'vehicle';
      entityId: string;
      vehicleId?: string;
      locationId?: string;
    },
  ) {
    // Validate file size (Section 85)
    let type = 'photo';
    if (data.mimeType.startsWith('video/')) {
      type = 'video';
      if (data.size > APP_CONFIG.MAX_FILE_SIZES.VIDEO) {
        throw new BadRequestException({
          code: 'FILE_TOO_LARGE',
          message: `Video size exceeds max allowed ${APP_CONFIG.MAX_FILE_SIZES.VIDEO / 1024 / 1024}MB`,
        });
      }
    } else if (data.mimeType.startsWith('image/')) {
      type = 'photo';
      if (data.size > APP_CONFIG.MAX_FILE_SIZES.PHOTO) {
        throw new BadRequestException({
          code: 'FILE_TOO_LARGE',
          message: `Photo size exceeds max allowed ${APP_CONFIG.MAX_FILE_SIZES.PHOTO / 1024 / 1024}MB`,
        });
      }
    } else {
      type = 'document_preview';
    }

    const mediaId = uuidv4();
    const locationId = data.locationId || userLocationId || 'default';
    const storageKey = `organizations/${orgId}/media/${type}s/${mediaId}-${path.basename(data.fileName)}`;
    const now = new Date().toISOString();

    let vehicleId = data.vehicleId;
    let customerId = null;
    let inspectionId = data.entityType === 'inspection' ? data.entityId : null;
    let workOrderId = data.entityType === 'work_order' ? data.entityId : null;

    if (inspectionId) {
      const insp = this.db.get<any>('SELECT vehicle_id, customer_id, location_id FROM inspections WHERE id = ?', [inspectionId]);
      if (insp) {
        vehicleId = insp.vehicle_id;
        customerId = insp.customer_id;
      }
    } else if (workOrderId) {
      const wo = this.db.get<any>('SELECT vehicle_id, customer_id, location_id FROM work_orders WHERE id = ?', [workOrderId]);
      if (wo) {
        vehicleId = wo.vehicle_id;
        customerId = wo.customer_id;
      }
    } else if (data.entityType === 'vehicle') {
      vehicleId = data.entityId;
      const v = this.db.get<any>('SELECT customer_id FROM vehicles WHERE id = ?', [vehicleId]);
      if (v) customerId = v.customer_id;
    }

    const checksum = crypto.createHash('sha256').update(`${mediaId}-${data.fileName}`).digest('hex');

    this.db.run(
      `INSERT INTO media (
        id, organization_id, location_id, vehicle_id, customer_id, inspection_id, work_order_id,
        uploaded_by, type, storage_key, mime_type, file_name, file_size, checksum, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
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
      ],
    );

    // Presigned upload URL
    const uploadUrl = `/api/v1/media/${mediaId}/direct-upload`;

    return {
      mediaId,
      uploadUrl,
      storageKey,
    };
  }

  completeUpload(
    orgId: string,
    id: string,
    data?: {
      damage_markers?: any[];
      duration?: number;
      width?: number;
      height?: number;
    },
  ) {
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

    this.db.run(
      `UPDATE media SET status = 'ready', duration = ?, metadata = ? WHERE id = ? AND organization_id = ?`,
      [data?.duration ?? media.duration, metadataStr, id, orgId],
    );

    this.ws.emitToOrganization(orgId, 'media.processed', { mediaId: id, status: 'ready' });

    return this.getById(orgId, id);
  }

  getById(orgId: string, id: string) {
    const m = this.db.get<any>(
      `SELECT m.*, u.first_name, u.last_name
       FROM media m
       JOIN users u ON m.uploaded_by = u.id
       WHERE m.id = ? AND m.organization_id = ? AND m.deleted_at IS NULL`,
      [id, orgId],
    );

    if (!m) {
      throw new NotFoundException({
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

  getDownloadUrl(orgId: string, id: string) {
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

  delete(orgId: string, id: string) {
    const m = this.getById(orgId, id);
    const now = new Date().toISOString();
    this.db.run(
      'UPDATE media SET deleted_at = ? WHERE id = ? AND organization_id = ?',
      [now, id, orgId],
    );
    return { success: true, message: 'Media deleted' };
  }

  // Retention cleanup worker (Section 76)
  runRetentionCleanup() {
    const now = new Date().toISOString();
    const rows = this.db.all<any>(
      `SELECT id FROM media WHERE retention_until IS NOT NULL AND retention_until < ? AND legal_hold = 0 AND deleted_at IS NULL`,
      [now],
    );

    for (const r of rows) {
      this.db.run('UPDATE media SET deleted_at = ?, archived_at = ? WHERE id = ?', [now, now, r.id]);
    }
    return { cleanedCount: rows.length };
  }
}
