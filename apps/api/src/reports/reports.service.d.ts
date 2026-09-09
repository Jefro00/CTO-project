import { DatabaseService } from '../database/database.service';
export declare class ReportsService {
    private readonly db;
    constructor(db: DatabaseService);
    getDashboard(orgId: string, locationId?: string): {
        vehiclesToday: any;
        inspectionsToday: any;
        workOrdersActive: any;
        workOrdersCompleted: any;
        averageCheck: number;
        overdueTasks: any;
        attentionItems: any[];
    };
    getVehiclesReport(orgId: string): {
        totalVehicles: any;
        byMake: any[];
    };
    getWorkOrdersReport(orgId: string): {
        totalOrders: any;
        totalRevenue: any;
        byStatus: any[];
    };
}
