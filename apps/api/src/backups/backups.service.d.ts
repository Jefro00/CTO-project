import { DatabaseService } from '../database/database.service';
import { BackupType } from '@automotive-os/types';
export declare class BackupsService {
    private readonly db;
    private backupDir;
    constructor(db: DatabaseService);
    getAll(orgId: string): any[];
    getById(orgId: string, id: string): any;
    create(orgId: string, userId: string, type?: BackupType): any;
    restore(orgId: string, backupId: string, confirmationToken: string): {
        success: boolean;
        message: string;
        manifest: any;
    };
}
