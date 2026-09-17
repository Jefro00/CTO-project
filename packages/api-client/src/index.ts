import {
  ApiResponse,
  Customer,
  Vehicle,
  VehicleHistoryItem,
  Inspection,
  WorkOrder,
  Document,
  Task,
  Reminder,
  Notification,
  AuditLog,
  Backup,
  User,
  Role,
  Location,
  Organization,
  GlobalSearchResult,
  DashboardReport,
} from '@automotive-os/types';

export class AutomotiveApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:4000/api/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setToken(token: string | null) {
    this.token = token;
  }

  public async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error?.message || `HTTP error ${res.status}: ${res.statusText}`;
      const err: any = new Error(errorMsg);
      err.status = res.status;
      err.code = data?.error?.code || 'UNKNOWN_ERROR';
      err.details = data?.error?.details;
      throw err;
    }

    return data;
  }

  // Auth API
  async login(email: string, password: string) {
    const res = await this.request<{ accessToken: string; refreshToken: string; user: User }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );
    if (res.data?.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return res;
  }

  async register(data: any) {
    return this.request<{ accessToken: string; refreshToken: string; user: User; organization: Organization }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async getMe() {
    return this.request<User>('/auth/me');
  }

  // Organization
  async getOrganization() {
    return this.request<Organization>('/organization');
  }

  async updateOrganization(data: Partial<Organization>) {
    return this.request<Organization>('/organization', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Locations
  async getLocations() {
    return this.request<Location[]>('/locations');
  }

  async createLocation(data: Partial<Location>) {
    return this.request<Location>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Customers
  async getCustomers(query?: { page?: number; limit?: number; search?: string }) {
    const params = new URLSearchParams(query as any).toString();
    return this.request<Customer[]>(`/customers${params ? `?${params}` : ''}`);
  }

  async searchCustomers(q: string) {
    return this.request<Customer[]>(`/customers/search?q=${encodeURIComponent(q)}`);
  }

  async getCustomer(id: string) {
    return this.request<Customer>(`/customers/${id}`);
  }

  async createCustomer(data: Partial<Customer>) {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: Partial<Customer>) {
    return this.request<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Vehicles
  async getVehicles(query?: { page?: number; limit?: number; make?: string; model?: string; search?: string }) {
    const params = new URLSearchParams(query as any).toString();
    return this.request<Vehicle[]>(`/vehicles${params ? `?${params}` : ''}`);
  }

  async searchVehicles(q: string) {
    return this.request<Vehicle[]>(`/vehicles/search?q=${encodeURIComponent(q)}`);
  }

  async getVehicle(id: string) {
    return this.request<Vehicle>(`/vehicles/${id}`);
  }

  async getVehicleHistory(id: string, query?: { page?: number; limit?: number }) {
    const params = new URLSearchParams(query as any).toString();
    return this.request<VehicleHistoryItem[]>(`/vehicles/${id}/history${params ? `?${params}` : ''}`);
  }

  async createVehicle(data: Partial<Vehicle>) {
    return this.request<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVehicle(id: string, data: Partial<Vehicle>) {
    return this.request<Vehicle>(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Inspections
  async getInspections(query?: { page?: number; limit?: number; status?: string; vehicle_id?: string }) {
    const params = new URLSearchParams(query as any).toString();
    return this.request<Inspection[]>(`/inspections${params ? `?${params}` : ''}`);
  }

  async getInspection(id: string) {
    return this.request<Inspection>(`/inspections/${id}`);
  }

  async createInspection(data: any) {
    return this.request<Inspection>('/inspections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeInspection(id: string) {
    return this.request<Inspection>(`/inspections/${id}/complete`, {
      method: 'POST',
    });
  }

  async cancelInspection(id: string) {
    return this.request<Inspection>(`/inspections/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Work Orders
  async getWorkOrders(query?: {
    page?: number;
    limit?: number;
    status?: string;
    vehicle_id?: string;
    assigned_to?: string;
    master_id?: string;
    search?: string;
  }) {
    const params = new URLSearchParams(query as any).toString();
    return this.request<WorkOrder[]>(`/work-orders${params ? `?${params}` : ''}`);
  }

  async getWorkOrder(id: string) {
    return this.request<WorkOrder>(`/work-orders/${id}`);
  }

  async createWorkOrder(data: any) {
    return this.request<WorkOrder>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkOrder(id: string, data: any) {
    return this.request<WorkOrder>(`/work-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async approveWorkOrder(id: string) {
    return this.request<WorkOrder>(`/work-orders/${id}/approve`, { method: 'POST' });
  }

  async startWorkOrder(id: string, master_id?: string) {
    return this.request<WorkOrder>(`/work-orders/${id}/start`, {
      method: 'POST',
      body: master_id ? JSON.stringify({ master_id }) : undefined,
    });
  }

  async completeWorkOrder(id: string) {
    return this.request<WorkOrder>(`/work-orders/${id}/complete`, { method: 'POST' });
  }

  async closeWorkOrder(id: string) {
    return this.request<WorkOrder>(`/work-orders/${id}/close`, { method: 'POST' });
  }

  async addWorkOrderItem(workOrderId: string, item: any) {
    return this.request<any>(`/work-orders/${workOrderId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  // Documents
  async getDocuments(query?: { vehicle_id?: string; work_order_id?: string }) {
    const params = new URLSearchParams(query as any).toString();
    return this.request<Document[]>(`/documents${params ? `?${params}` : ''}`);
  }

  async generateDocument(data: {
    type: string;
    work_order_id?: string;
    vehicle_id: string;
    customer_id: string;
    location_id: string;
    name?: string;
  }) {
    return this.request<Document>('/documents/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tasks & Reminders
  async getTasks(query?: { assigned_to?: string; status?: string }) {
    const params = new URLSearchParams(query as any).toString();
    return this.request<Task[]>(`/tasks${params ? `?${params}` : ''}`);
  }

  async createTask(data: any) {
    return this.request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) });
  }

  async completeTask(id: string) {
    return this.request<Task>(`/tasks/${id}/complete`, { method: 'POST' });
  }

  async getReminders(query?: { vehicle_id?: string }) {
    const params = new URLSearchParams(query as any).toString();
    return this.request<Reminder[]>(`/reminders${params ? `?${params}` : ''}`);
  }

  async createReminder(data: any) {
    return this.request<Reminder>('/reminders', { method: 'POST', body: JSON.stringify(data) });
  }

  async completeReminder(id: string) {
    return this.request<Reminder>(`/reminders/${id}/complete`, { method: 'POST' });
  }

  // Users & Roles
  async getUsers(location_id?: string) {
    const query = location_id ? `?location_id=${location_id}` : '';
    return this.request<User[]>(`/users${query}`);
  }

  async getRoles() {
    return this.request<Role[]>('/roles');
  }

  // Notifications
  async getNotifications() {
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<Notification>(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', { method: 'POST' });
  }

  // Global Search
  async globalSearch(q: string) {
    return this.request<GlobalSearchResult>(`/search?q=${encodeURIComponent(q)}`);
  }

  // Reports
  async getDashboardReport() {
    return this.request<DashboardReport>('/reports/dashboard');
  }

  // Audit
  async getAuditLogs(query?: { page?: number; limit?: number; entity_type?: string }) {
    const params = new URLSearchParams(query as any).toString();
    return this.request<AuditLog[]>(`/audit${params ? `?${params}` : ''}`);
  }

  // Backups
  async getBackups() {
    return this.request<Backup[]>('/backups');
  }

  async createBackup(type: string = 'manual') {
    return this.request<Backup>('/backups', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  async restoreBackup(id: string, confirmationToken: string) {
    return this.request<{ success: boolean; message: string }>(`/backups/${id}/restore`, {
      method: 'POST',
      body: JSON.stringify({ confirmationToken }),
    });
  }
}
