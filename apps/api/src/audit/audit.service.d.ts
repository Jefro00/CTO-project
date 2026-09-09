import { DatabaseService } from '../database/database.service';
export declare class AuditService {
    private readonly db;
    constructor(db: DatabaseService);
    getAll(orgId: string, query?: {
        page?: number;
        limit?: number;
        entity_type?: string;
        action?: string;
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
}
