import { DatabaseService } from '../database/database.service';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
export declare class InspectionsService {
    private readonly db;
    private readonly ws;
    constructor(db: DatabaseService, ws: AppWebSocketGateway);
    getAll(orgId: string, query?: {
        page?: number;
        limit?: number;
        status?: string;
        location_id?: string;
        vehicle_id?: string;
    }): {
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    };
    getById(orgId: string, id: string): any;
    create(orgId: string, userId: string, userLocationId: string | null, data: any): any;
    update(orgId: string, id: string, data: any): any;
    complete(orgId: string, id: string): any;
    cancel(orgId: string, id: string): any;
    getItems(orgId: string, inspectionId: string): any[];
    addItem(orgId: string, inspectionId: string, data: any): any;
    updateItem(orgId: string, inspectionId: string, itemId: string, data: any): any;
}
