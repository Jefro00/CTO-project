import { DatabaseService } from '../database/database.service';
import { DocumentType } from '@automotive-os/types';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
export declare class DocumentsService {
    private readonly db;
    private readonly ws;
    constructor(db: DatabaseService, ws: AppWebSocketGateway);
    getAll(orgId: string, query?: {
        vehicle_id?: string;
        work_order_id?: string;
        customer_id?: string;
        type?: string;
    }): any[];
    getById(orgId: string, id: string): any;
    create(orgId: string, userId: string, data: any): any;
    generate(orgId: string, userId: string, data: {
        type: DocumentType | string;
        work_order_id?: string;
        vehicle_id: string;
        customer_id: string;
        location_id: string;
        name?: string;
    }): any;
    delete(orgId: string, id: string): {
        success: boolean;
        message: string;
    };
}
