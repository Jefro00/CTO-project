import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    getTasks(user: any, assignedTo?: string, status?: string, priority?: string, locationId?: string, vehicleId?: string): Promise<any[]>;
    createTask(user: any, body: any): Promise<any>;
    getTask(user: any, id: string): Promise<any>;
    updateTask(user: any, id: string, body: any): Promise<any>;
    completeTask(user: any, id: string): Promise<any>;
}
