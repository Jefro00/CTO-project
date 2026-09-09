import { DatabaseService } from '../database/database.service';
export declare class SearchService {
    private readonly db;
    constructor(db: DatabaseService);
    search(orgId: string, q: string): {
        vehicles: any[];
        customers: any[];
        workOrders: any[];
        documents: any[];
    };
}
