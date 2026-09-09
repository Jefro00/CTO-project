import { OrganizationsService } from './organizations.service';
export declare class OrganizationsController {
    private readonly orgService;
    constructor(orgService: OrganizationsService);
    getOrganization(user: any): Promise<any>;
    updateOrganization(user: any, body: any): Promise<any>;
}
