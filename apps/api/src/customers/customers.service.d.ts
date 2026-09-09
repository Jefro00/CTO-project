import { DatabaseService } from '../database/database.service';
export declare class CustomersService {
    private readonly db;
    constructor(db: DatabaseService);
    getAll(orgId: string, query?: {
        page?: number;
        limit?: number;
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
    search(orgId: string, q: string): any[];
    getById(orgId: string, id: string): any;
    create(orgId: string, data: any): any;
    update(orgId: string, id: string, data: any): any;
    delete(orgId: string, id: string): {
        success: boolean;
        message: string;
    };
}
