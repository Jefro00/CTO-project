"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomotiveApiClient = void 0;
class AutomotiveApiClient {
    baseUrl;
    token = null;
    constructor(baseUrl = 'http://localhost:4000/api/v1') {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }
    setToken(token) {
        this.token = token;
    }
    async request(path, options = {}) {
        const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...options.headers,
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
            const err = new Error(errorMsg);
            err.status = res.status;
            err.code = data?.error?.code || 'UNKNOWN_ERROR';
            err.details = data?.error?.details;
            throw err;
        }
        return data;
    }
    // Auth API
    async login(email, password) {
        const res = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (res.data?.accessToken) {
            this.setToken(res.data.accessToken);
        }
        return res;
    }
    async register(data) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async getMe() {
        return this.request('/auth/me');
    }
    // Organization
    async getOrganization() {
        return this.request('/organization');
    }
    async updateOrganization(data) {
        return this.request('/organization', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    // Locations
    async getLocations() {
        return this.request('/locations');
    }
    async createLocation(data) {
        return this.request('/locations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // Customers
    async getCustomers(query) {
        const params = new URLSearchParams(query).toString();
        return this.request(`/customers${params ? `?${params}` : ''}`);
    }
    async searchCustomers(q) {
        return this.request(`/customers/search?q=${encodeURIComponent(q)}`);
    }
    async getCustomer(id) {
        return this.request(`/customers/${id}`);
    }
    async createCustomer(data) {
        return this.request('/customers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateCustomer(id, data) {
        return this.request(`/customers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    // Vehicles
    async getVehicles(query) {
        const params = new URLSearchParams(query).toString();
        return this.request(`/vehicles${params ? `?${params}` : ''}`);
    }
    async searchVehicles(q) {
        return this.request(`/vehicles/search?q=${encodeURIComponent(q)}`);
    }
    async getVehicle(id) {
        return this.request(`/vehicles/${id}`);
    }
    async getVehicleHistory(id, query) {
        const params = new URLSearchParams(query).toString();
        return this.request(`/vehicles/${id}/history${params ? `?${params}` : ''}`);
    }
    async createVehicle(data) {
        return this.request('/vehicles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateVehicle(id, data) {
        return this.request(`/vehicles/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    // Inspections
    async getInspections(query) {
        const params = new URLSearchParams(query).toString();
        return this.request(`/inspections${params ? `?${params}` : ''}`);
    }
    async getInspection(id) {
        return this.request(`/inspections/${id}`);
    }
    async createInspection(data) {
        return this.request('/inspections', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async completeInspection(id) {
        return this.request(`/inspections/${id}/complete`, {
            method: 'POST',
        });
    }
    async cancelInspection(id) {
        return this.request(`/inspections/${id}/cancel`, {
            method: 'POST',
        });
    }
    // Work Orders
    async getWorkOrders(query) {
        const params = new URLSearchParams(query).toString();
        return this.request(`/work-orders${params ? `?${params}` : ''}`);
    }
    async getWorkOrder(id) {
        return this.request(`/work-orders/${id}`);
    }
    async createWorkOrder(data) {
        return this.request('/work-orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updateWorkOrder(id, data) {
        return this.request(`/work-orders/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    async approveWorkOrder(id) {
        return this.request(`/work-orders/${id}/approve`, { method: 'POST' });
    }
    async startWorkOrder(id) {
        return this.request(`/work-orders/${id}/start`, { method: 'POST' });
    }
    async completeWorkOrder(id) {
        return this.request(`/work-orders/${id}/complete`, { method: 'POST' });
    }
    async closeWorkOrder(id) {
        return this.request(`/work-orders/${id}/close`, { method: 'POST' });
    }
    async addWorkOrderItem(workOrderId, item) {
        return this.request(`/work-orders/${workOrderId}/items`, {
            method: 'POST',
            body: JSON.stringify(item),
        });
    }
    // Documents
    async getDocuments(query) {
        const params = new URLSearchParams(query).toString();
        return this.request(`/documents${params ? `?${params}` : ''}`);
    }
    async generateDocument(data) {
        return this.request('/documents/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // Tasks & Reminders
    async getTasks(query) {
        const params = new URLSearchParams(query).toString();
        return this.request(`/tasks${params ? `?${params}` : ''}`);
    }
    async createTask(data) {
        return this.request('/tasks', { method: 'POST', body: JSON.stringify(data) });
    }
    async completeTask(id) {
        return this.request(`/tasks/${id}/complete`, { method: 'POST' });
    }
    async getReminders(query) {
        const params = new URLSearchParams(query).toString();
        return this.request(`/reminders${params ? `?${params}` : ''}`);
    }
    async createReminder(data) {
        return this.request('/reminders', { method: 'POST', body: JSON.stringify(data) });
    }
    // Notifications
    async getNotifications() {
        return this.request('/notifications');
    }
    async markNotificationRead(id) {
        return this.request(`/notifications/${id}/read`, { method: 'POST' });
    }
    async markAllNotificationsRead() {
        return this.request('/notifications/read-all', { method: 'POST' });
    }
    // Global Search
    async globalSearch(q) {
        return this.request(`/search?q=${encodeURIComponent(q)}`);
    }
    // Reports
    async getDashboardReport() {
        return this.request('/reports/dashboard');
    }
    // Audit
    async getAuditLogs(query) {
        const params = new URLSearchParams(query).toString();
        return this.request(`/audit${params ? `?${params}` : ''}`);
    }
    // Backups
    async getBackups() {
        return this.request('/backups');
    }
    async createBackup(type = 'manual') {
        return this.request('/backups', {
            method: 'POST',
            body: JSON.stringify({ type }),
        });
    }
    async restoreBackup(id, confirmationToken) {
        return this.request(`/backups/${id}/restore`, {
            method: 'POST',
            body: JSON.stringify({ confirmationToken }),
        });
    }
}
exports.AutomotiveApiClient = AutomotiveApiClient;
//# sourceMappingURL=index.js.map