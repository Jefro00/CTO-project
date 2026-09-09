import { DatabaseService } from '../database/database.service';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
export declare class WorkOrdersService {
    private readonly db;
    private readonly ws;
    constructor(db: DatabaseService, ws: AppWebSocketGateway);
    getAll(orgId: string, query?: {
        page?: number;
        limit?: number;
        status?: string;
        location_id?: string;
        vehicle_id?: string;
        customer_id?: string;
        search?: string;
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
    create(orgId: string, advisorId: string, userLocationId: string | null, data: any): any;
    update(orgId: string, id: string, data: any): any;
    approve(orgId: string, id: string): any;
    start(orgId: string, id: string): any;
    complete(orgId: string, id: string): any;
    close(orgId: string, id: string): any;
    cancel(orgId: string, id: string): any;
    getItems(orgId: string, workOrderId: string): any[];
    addItem(orgId: string, workOrderId: string, data: any): any;
    updateItem(orgId: string, workOrderId: string, itemId: string, data: any): any;
    deleteItem(orgId: string, workOrderId: string, itemId: string): {
        success: boolean;
        message: string;
    };
    private recalculateTotal;
}
