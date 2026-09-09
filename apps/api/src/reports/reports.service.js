"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let ReportsService = class ReportsService {
    db;
    constructor(db) {
        this.db = db;
    }
    getDashboard(orgId, locationId) {
        const today = new Date().toISOString().split('T')[0];
        // 1. Vehicles today
        const vTodayRow = this.db.get(`SELECT COUNT(*) as count FROM vehicles WHERE organization_id = ? AND created_at >= ? AND deleted_at IS NULL`, [orgId, `${today}T00:00:00.000Z`]);
        // 2. Inspections today
        const inspTodayRow = this.db.get(`SELECT COUNT(*) as count FROM inspections WHERE organization_id = ? AND started_at >= ?`, [orgId, `${today}T00:00:00.000Z`]);
        // 3. Active work orders (in_progress, diagnostics, approved, waiting_parts, accepted)
        const activeWoRow = this.db.get(`SELECT COUNT(*) as count FROM work_orders WHERE organization_id = ? AND status IN ('accepted', 'diagnostics', 'waiting_approval', 'approved', 'in_progress', 'waiting_parts')`, [orgId]);
        // 4. Completed work orders today / ready
        const completedWoRow = this.db.get(`SELECT COUNT(*) as count FROM work_orders WHERE organization_id = ? AND status IN ('completed', 'ready', 'paid', 'closed')`, [orgId]);
        // 5. Average check (closed/completed work orders)
        const avgRow = this.db.get(`SELECT AVG(total) as avg_total FROM work_orders WHERE organization_id = ? AND total > 0`, [orgId]);
        // 6. Overdue tasks
        const now = new Date().toISOString();
        const overdueRow = this.db.get(`SELECT COUNT(*) as count FROM tasks WHERE organization_id = ? AND status != 'completed' AND due_at IS NOT NULL AND due_at < ?`, [orgId, now]);
        // 7. Attention items (Section 62)
        const attentionItems = [];
        // Orders waiting approval
        const waitingApproval = this.db.all(`SELECT w.id, w.number, v.make, v.model FROM work_orders w JOIN vehicles v ON w.vehicle_id = v.id WHERE w.organization_id = ? AND w.status = 'waiting_approval' LIMIT 3`, [orgId]);
        for (const w of waitingApproval) {
            attentionItems.push({
                id: w.id,
                type: 'approval',
                title: `Заказ-наряд #${w.number} — ${w.make} ${w.model}`,
                subtitle: 'Ожидает согласования с клиентом',
                link: `/work-orders/${w.id}`,
                severity: 'warning',
            });
        }
        // Overdue tasks
        const overdueTasks = this.db.all(`SELECT t.id, t.title, v.make, v.model FROM tasks t LEFT JOIN vehicles v ON t.vehicle_id = v.id WHERE t.organization_id = ? AND t.status != 'completed' AND t.due_at IS NOT NULL AND t.due_at < ? LIMIT 3`, [orgId, now]);
        for (const t of overdueTasks) {
            attentionItems.push({
                id: t.id,
                type: 'overdue_task',
                title: t.title,
                subtitle: t.make ? `Автомобиль: ${t.make} ${t.model}` : 'Срок выполнения истек',
                link: `/tasks`,
                severity: 'danger',
            });
        }
        return {
            vehiclesToday: vTodayRow?.count || 0,
            inspectionsToday: inspTodayRow?.count || 0,
            workOrdersActive: activeWoRow?.count || 0,
            workOrdersCompleted: completedWoRow?.count || 0,
            averageCheck: Math.round(avgRow?.avg_total || 0),
            overdueTasks: overdueRow?.count || 0,
            attentionItems,
        };
    }
    getVehiclesReport(orgId) {
        const totalVehicles = this.db.get('SELECT COUNT(*) as count FROM vehicles WHERE organization_id = ? AND deleted_at IS NULL', [orgId]);
        const byMake = this.db.all(`SELECT make, COUNT(*) as count FROM vehicles WHERE organization_id = ? AND deleted_at IS NULL GROUP BY make ORDER BY count DESC LIMIT 10`, [orgId]);
        return {
            totalVehicles: totalVehicles?.count || 0,
            byMake,
        };
    }
    getWorkOrdersReport(orgId) {
        const totalOrders = this.db.get('SELECT COUNT(*) as count, SUM(total) as revenue FROM work_orders WHERE organization_id = ?', [orgId]);
        const byStatus = this.db.all(`SELECT status, COUNT(*) as count FROM work_orders WHERE organization_id = ? GROUP BY status`, [orgId]);
        return {
            totalOrders: totalOrders?.count || 0,
            totalRevenue: totalOrders?.revenue || 0,
            byStatus,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map