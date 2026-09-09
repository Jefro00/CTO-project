import { DatabaseService } from '../database/database.service';
export declare class UsersService {
    private readonly db;
    constructor(db: DatabaseService);
    getAll(orgId: string, locationId?: string): any[];
    getById(orgId: string, id: string): any;
    create(orgId: string, data: any): any;
    update(orgId: string, id: string, data: any): any;
    delete(orgId: string, id: string, callerRole: string): {
        success: boolean;
        message: string;
    };
}
