import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(user: any): Promise<any[]>;
    markRead(user: any, id: string): Promise<any>;
    markAllRead(user: any): Promise<{
        success: boolean;
    }>;
}
