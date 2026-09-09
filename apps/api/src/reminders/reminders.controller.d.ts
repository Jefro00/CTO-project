import { RemindersService } from './reminders.service';
export declare class RemindersController {
    private readonly remindersService;
    constructor(remindersService: RemindersService);
    getReminders(user: any, vehicleId?: string, customerId?: string, status?: string): Promise<any[]>;
    createReminder(user: any, body: any): Promise<any>;
    getReminder(user: any, id: string): Promise<any>;
    updateReminder(user: any, id: string, body: any): Promise<any>;
    completeReminder(user: any, id: string): Promise<any>;
}
