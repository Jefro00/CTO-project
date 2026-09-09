import { DatabaseService } from '../database/database.service';
export declare class NotificationsService {
    private readonly db;
    constructor(db: DatabaseService);
    getAll(orgId: string, userId: string): any[];
    markAsRead(orgId: string, userId: string, id: string): any;
    markAllAsRead(orgId: string, userId: string): {
        success: boolean;
    };
}
