import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AppWebSocketModule } from './websocket/websocket.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { LocationsModule } from './locations/locations.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CustomersModule } from './customers/customers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { InspectionsModule } from './inspections/inspections.module';
import { MediaModule } from './media/media.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { DocumentsModule } from './documents/documents.module';
import { TasksModule } from './tasks/tasks.module';
import { RemindersModule } from './reminders/reminders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { AuditModule } from './audit/audit.module';
import { BackupsModule } from './backups/backups.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';
import { WorkersModule } from './workers/workers.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { LocationScopeGuard } from './common/guards/location-scope.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    DatabaseModule,
    AppWebSocketModule,
    AuthModule,
    OrganizationsModule,
    LocationsModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    CustomersModule,
    VehiclesModule,
    InspectionsModule,
    MediaModule,
    WorkOrdersModule,
    DocumentsModule,
    TasksModule,
    RemindersModule,
    NotificationsModule,
    SearchModule,
    AuditModule,
    BackupsModule,
    ReportsModule,
    HealthModule,
    WorkersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: LocationScopeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
