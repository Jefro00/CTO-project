import { DatabaseService } from '../database/database.service';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
export declare class TasksService {
    private readonly db;
    private readonly ws;
    constructor(db: DatabaseService, ws: AppWebSocketGateway);
    getAll(orgId: string, query?: {
        assigned_to?: string;
        status?: string;
        priority?: string;
        location_id?: string;
        vehicle_id?: string;
    }): any[];
    getById(orgId: string, id: string): any;
    create(orgId: string, userId: string, userLocationId: string | null, data: any): any;
    update(orgId: string, id: string, data: any): any;
    complete(orgId: string, id: string): any;
}
