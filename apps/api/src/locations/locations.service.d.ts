import { DatabaseService } from '../database/database.service';
export declare class LocationsService {
    private readonly db;
    constructor(db: DatabaseService);
    getAll(orgId: string): any[];
    getById(orgId: string, id: string): any;
    create(orgId: string, data: any): any;
    update(orgId: string, id: string, data: any): any;
    delete(orgId: string, id: string): {
        success: boolean;
        message: string;
    };
}
