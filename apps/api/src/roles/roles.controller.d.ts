import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    getRoles(user: any): Promise<any[]>;
    createRole(user: any, body: any): Promise<any>;
    getRole(user: any, id: string): Promise<any>;
    updateRole(user: any, id: string, body: any): Promise<any>;
    deleteRole(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
