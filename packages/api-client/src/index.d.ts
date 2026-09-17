import { ApiResponse, Customer, Vehicle, VehicleHistoryItem, Inspection, WorkOrder, Document, Task, Reminder, Notification, AuditLog, Backup, User, Role, Location, Organization, GlobalSearchResult, DashboardReport } from '@automotive-os/types';
export declare class AutomotiveApiClient {
    private baseUrl;
    private token;
    constructor(baseUrl?: string);
    setToken(token: string | null): void;
    request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>>;
    login(email: string, password: string): Promise<ApiResponse<{
        accessToken: string;
        refreshToken: string;
        user: User;
    }>>;
    register(data: any): Promise<ApiResponse<{
        accessToken: string;
        refreshToken: string;
        user: User;
        organization: Organization;
    }>>;
    getMe(): Promise<ApiResponse<User>>;
    getOrganization(): Promise<ApiResponse<Organization>>;
    updateOrganization(data: Partial<Organization>): Promise<ApiResponse<Organization>>;
    getLocations(): Promise<ApiResponse<Location[]>>;
    createLocation(data: Partial<Location>): Promise<ApiResponse<Location>>;
    getCustomers(query?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<ApiResponse<Customer[]>>;
    searchCustomers(q: string): Promise<ApiResponse<Customer[]>>;
    getCustomer(id: string): Promise<ApiResponse<Customer>>;
    createCustomer(data: Partial<Customer>): Promise<ApiResponse<Customer>>;
    updateCustomer(id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>>;
    getVehicles(query?: {
        page?: number;
        limit?: number;
        make?: string;
        model?: string;
        search?: string;
    }): Promise<ApiResponse<Vehicle[]>>;
    searchVehicles(q: string): Promise<ApiResponse<Vehicle[]>>;
    getVehicle(id: string): Promise<ApiResponse<Vehicle>>;
    getVehicleHistory(id: string, query?: {
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<VehicleHistoryItem[]>>;
    createVehicle(data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>>;
    updateVehicle(id: string, data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>>;
    getInspections(query?: {
        page?: number;
        limit?: number;
        status?: string;
        vehicle_id?: string;
    }): Promise<ApiResponse<Inspection[]>>;
    getInspection(id: string): Promise<ApiResponse<Inspection>>;
    createInspection(data: any): Promise<ApiResponse<Inspection>>;
    completeInspection(id: string): Promise<ApiResponse<Inspection>>;
    cancelInspection(id: string): Promise<ApiResponse<Inspection>>;
    getWorkOrders(query?: {
        page?: number;
        limit?: number;
        status?: string;
        vehicle_id?: string;
        assigned_to?: string;
        master_id?: string;
        search?: string;
    }): Promise<ApiResponse<WorkOrder[]>>;
    getWorkOrder(id: string): Promise<ApiResponse<WorkOrder>>;
    createWorkOrder(data: any): Promise<ApiResponse<WorkOrder>>;
    updateWorkOrder(id: string, data: any): Promise<ApiResponse<WorkOrder>>;
    approveWorkOrder(id: string): Promise<ApiResponse<WorkOrder>>;
    startWorkOrder(id: string, master_id?: string): Promise<ApiResponse<WorkOrder>>;
    completeWorkOrder(id: string): Promise<ApiResponse<WorkOrder>>;
    closeWorkOrder(id: string): Promise<ApiResponse<WorkOrder>>;
    addWorkOrderItem(workOrderId: string, item: any): Promise<ApiResponse<any>>;
    getDocuments(query?: {
        vehicle_id?: string;
        work_order_id?: string;
    }): Promise<ApiResponse<Document[]>>;
    generateDocument(data: {
        type: string;
        work_order_id?: string;
        vehicle_id: string;
        customer_id: string;
        location_id: string;
        name?: string;
    }): Promise<ApiResponse<Document>>;
    getTasks(query?: {
        assigned_to?: string;
        status?: string;
    }): Promise<ApiResponse<Task[]>>;
    createTask(data: any): Promise<ApiResponse<Task>>;
    completeTask(id: string): Promise<ApiResponse<Task>>;
    getReminders(query?: {
        vehicle_id?: string;
    }): Promise<ApiResponse<Reminder[]>>;
    createReminder(data: any): Promise<ApiResponse<Reminder>>;
    completeReminder(id: string): Promise<ApiResponse<Reminder>>;
    getUsers(location_id?: string): Promise<ApiResponse<User[]>>;
    getRoles(): Promise<ApiResponse<Role[]>>;
    getNotifications(): Promise<ApiResponse<Notification[]>>;
    markNotificationRead(id: string): Promise<ApiResponse<Notification>>;
    markAllNotificationsRead(): Promise<ApiResponse<{
        success: boolean;
    }>>;
    globalSearch(q: string): Promise<ApiResponse<GlobalSearchResult>>;
    getDashboardReport(): Promise<ApiResponse<DashboardReport>>;
    getAuditLogs(query?: {
        page?: number;
        limit?: number;
        entity_type?: string;
    }): Promise<ApiResponse<AuditLog[]>>;
    getBackups(): Promise<ApiResponse<Backup[]>>;
    createBackup(type?: string): Promise<ApiResponse<Backup>>;
    restoreBackup(id: string, confirmationToken: string): Promise<ApiResponse<{
        success: boolean;
        message: string;
    }>>;
}
