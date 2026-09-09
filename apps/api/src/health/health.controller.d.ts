import { DatabaseService } from '../database/database.service';
export declare class HealthController {
    private readonly db;
    constructor(db: DatabaseService);
    check(): {
        status: string;
        database: string;
        redis: string;
        storage: string;
        uptime: number;
        timestamp: string;
    };
}
