import { DatabaseService } from '../database/database.service';
import { VehicleHistoryItem } from '@automotive-os/types';
export declare class VehiclesService {
    private readonly db;
    constructor(db: DatabaseService);
    getAll(orgId: string, query?: {
        page?: number;
        limit?: number;
        make?: string;
        model?: string;
        year?: number;
        license_plate?: string;
        vin?: string;
        status?: string;
        search?: string;
    }): {
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    };
    search(orgId: string, q: string): any[];
    getById(orgId: string, id: string): any;
    create(orgId: string, data: any): any;
    update(orgId: string, id: string, data: any): any;
    delete(orgId: string, id: string): {
        success: boolean;
        message: string;
    };
    getHistory(orgId: string, vehicleId: string, query?: {
        page?: number;
        limit?: number;
    }): {
        data: VehicleHistoryItem[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
