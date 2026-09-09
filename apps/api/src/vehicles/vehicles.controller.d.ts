import { VehiclesService } from './vehicles.service';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    searchVehicles(user: any, q: string): Promise<any[]>;
    getVehicleHistory(user: any, id: string, page?: number, limit?: number): Promise<{
        data: import("@automotive-os/types").VehicleHistoryItem[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getVehicles(user: any, page?: number, limit?: number, make?: string, model?: string, year?: number, licensePlate?: string, vin?: string, status?: string, search?: string): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    createVehicle(user: any, body: any): Promise<any>;
    getVehicle(user: any, id: string): Promise<any>;
    updateVehicle(user: any, id: string, body: any): Promise<any>;
    deleteVehicle(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
