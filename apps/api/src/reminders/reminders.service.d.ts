import { DatabaseService } from '../database/database.service';
export declare class RemindersService {
    private readonly db;
    constructor(db: DatabaseService);
    getAll(orgId: string, query?: {
        vehicle_id?: string;
        customer_id?: string;
        status?: string;
    }): any[];
    getById(orgId: string, id: string): any;
    create(orgId: string, userId: string, userLocationId: string | null, data: any): any;
    update(orgId: string, id: string, data: any): any;
    complete(orgId: string, id: string): any;
}
