import { DatabaseService } from '../database/database.service';
export declare class PermissionsController {
    private readonly db;
    constructor(db: DatabaseService);
    getPermissions(): Promise<any[]>;
}
