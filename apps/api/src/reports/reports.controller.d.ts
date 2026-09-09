import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(user: any): Promise<{
        vehiclesToday: any;
        inspectionsToday: any;
        workOrdersActive: any;
        workOrdersCompleted: any;
        averageCheck: number;
        overdueTasks: any;
        attentionItems: any[];
    }>;
    getVehiclesReport(user: any): Promise<{
        totalVehicles: any;
        byMake: any[];
    }>;
    getWorkOrdersReport(user: any): Promise<{
        totalOrders: any;
        totalRevenue: any;
        byStatus: any[];
    }>;
}
