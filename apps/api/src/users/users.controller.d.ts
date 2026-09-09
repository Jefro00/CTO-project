import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUsers(user: any, locationId?: string): Promise<any[]>;
    createUser(user: any, body: any): Promise<any>;
    getUser(user: any, id: string): Promise<any>;
    updateUser(user: any, id: string, body: any): Promise<any>;
    deleteUser(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
