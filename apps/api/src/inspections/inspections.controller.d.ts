import { InspectionsService } from './inspections.service';
export declare class InspectionsController {
    private readonly inspectionsService;
    constructor(inspectionsService: InspectionsService);
    getInspections(user: any, page?: number, limit?: number, status?: string, locationId?: string, vehicleId?: string): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createInspection(user: any, body: any): Promise<any>;
    getInspection(user: any, id: string): Promise<any>;
    updateInspection(user: any, id: string, body: any): Promise<any>;
    completeInspection(user: any, id: string): Promise<any>;
    cancelInspection(user: any, id: string): Promise<any>;
    getItems(user: any, id: string): Promise<any[]>;
    addItem(user: any, id: string, body: any): Promise<any>;
    updateItem(user: any, id: string, itemId: string, body: any): Promise<any>;
}
