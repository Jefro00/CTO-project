import { BackupsService } from './backups.service';
export declare class BackupsController {
    private readonly backupsService;
    constructor(backupsService: BackupsService);
    getBackups(user: any): Promise<any[]>;
    createBackup(user: any, body: any): Promise<any>;
    getBackup(user: any, id: string): Promise<any>;
    restoreBackup(user: any, id: string, body: any): Promise<{
        success: boolean;
        message: string;
        manifest: any;
    }>;
}
