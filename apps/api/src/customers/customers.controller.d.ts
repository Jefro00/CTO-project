import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    searchCustomers(user: any, q: string): Promise<any[]>;
    getCustomers(user: any, page?: number, limit?: number, search?: string): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createCustomer(user: any, body: any): Promise<any>;
    getCustomer(user: any, id: string): Promise<any>;
    updateCustomer(user: any, id: string, body: any): Promise<any>;
    deleteCustomer(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
