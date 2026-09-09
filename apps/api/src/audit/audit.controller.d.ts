import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getLogs(user: any, page?: number, limit?: number, entityType?: string, action?: string): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    getLog(user: any, id: string): Promise<any>;
}
