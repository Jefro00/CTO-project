import { DatabaseService } from '../database/database.service';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
export declare class MediaService {
    private readonly db;
    private readonly ws;
    private uploadDir;
    constructor(db: DatabaseService, ws: AppWebSocketGateway);
    generateUploadUrl(orgId: string, userId: string, userLocationId: string | null, data: {
        fileName: string;
        mimeType: string;
        size: number;
        entityType: 'inspection' | 'work_order' | 'vehicle';
        entityId: string;
        vehicleId?: string;
        locationId?: string;
    }): {
        mediaId: string;
        uploadUrl: string;
        storageKey: string;
    };
    completeUpload(orgId: string, id: string, data?: {
        damage_markers?: any[];
        duration?: number;
        width?: number;
        height?: number;
    }): any;
    getById(orgId: string, id: string): any;
    getDownloadUrl(orgId: string, id: string): {
        mediaId: any;
        fileName: any;
        mimeType: any;
        url: string;
        expiresAt: string;
    };
    delete(orgId: string, id: string): {
        success: boolean;
        message: string;
    };
    runRetentionCleanup(): {
        cleanedCount: number;
    };
}
