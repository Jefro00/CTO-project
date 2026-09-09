import { DatabaseService } from '../database/database.service';
export declare class OrganizationsService {
    private readonly db;
    constructor(db: DatabaseService);
    getOrganization(orgId: string): any;
    updateOrganization(orgId: string, data: any): any;
}
