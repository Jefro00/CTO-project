"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const database_module_1 = require("./database/database.module");
const websocket_module_1 = require("./websocket/websocket.module");
const auth_module_1 = require("./auth/auth.module");
const organizations_module_1 = require("./organizations/organizations.module");
const locations_module_1 = require("./locations/locations.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const permissions_module_1 = require("./permissions/permissions.module");
const customers_module_1 = require("./customers/customers.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const inspections_module_1 = require("./inspections/inspections.module");
const media_module_1 = require("./media/media.module");
const work_orders_module_1 = require("./work-orders/work-orders.module");
const documents_module_1 = require("./documents/documents.module");
const tasks_module_1 = require("./tasks/tasks.module");
const reminders_module_1 = require("./reminders/reminders.module");
const notifications_module_1 = require("./notifications/notifications.module");
const search_module_1 = require("./search/search.module");
const audit_module_1 = require("./audit/audit.module");
const backups_module_1 = require("./backups/backups.module");
const reports_module_1 = require("./reports/reports.module");
const health_module_1 = require("./health/health.module");
const workers_module_1 = require("./workers/workers.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const permission_guard_1 = require("./common/guards/permission.guard");
const location_scope_guard_1 = require("./common/guards/location-scope.guard");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            websocket_module_1.AppWebSocketModule,
            auth_module_1.AuthModule,
            organizations_module_1.OrganizationsModule,
            locations_module_1.LocationsModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            customers_module_1.CustomersModule,
            vehicles_module_1.VehiclesModule,
            inspections_module_1.InspectionsModule,
            media_module_1.MediaModule,
            work_orders_module_1.WorkOrdersModule,
            documents_module_1.DocumentsModule,
            tasks_module_1.TasksModule,
            reminders_module_1.RemindersModule,
            notifications_module_1.NotificationsModule,
            search_module_1.SearchModule,
            audit_module_1.AuditModule,
            backups_module_1.BackupsModule,
            reports_module_1.ReportsModule,
            health_module_1.HealthModule,
            workers_module_1.WorkersModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: location_scope_guard_1.LocationScopeGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permission_guard_1.PermissionGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map