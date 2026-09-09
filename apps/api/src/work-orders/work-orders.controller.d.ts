import { WorkOrdersService } from './work-orders.service';
export declare class WorkOrdersController {
    private readonly workOrdersService;
    constructor(workOrdersService: WorkOrdersService);
    getWorkOrders(user: any, page?: number, limit?: number, status?: string, locationId?: string, vehicleId?: string, customerId?: string, search?: string): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createWorkOrder(user: any, body: any): Promise<any>;
    getWorkOrder(user: any, id: string): Promise<any>;
    updateWorkOrder(user: any, id: string, body: any): Promise<any>;
    approveWorkOrder(user: any, id: string): Promise<any>;
    startWorkOrder(user: any, id: string): Promise<any>;
    completeWorkOrder(user: any, id: string): Promise<any>;
    closeWorkOrder(user: any, id: string): Promise<any>;
    cancelWorkOrder(user: any, id: string): Promise<any>;
    getItems(user: any, id: string): Promise<any[]>;
    addItem(user: any, id: string, body: any): Promise<any>;
    updateItem(user: any, id: string, itemId: string, body: any): Promise<any>;
    deleteItem(user: any, id: string, itemId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
