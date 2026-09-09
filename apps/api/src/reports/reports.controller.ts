import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @RequirePermission('reports.read')
  @ApiOperation({ summary: 'Get main dashboard KPIs and attention items (Section 53 & 62)' })
  async getDashboard(@CurrentUser() user: any) {
    return this.reportsService.getDashboard(user.organization_id, user.location_id);
  }

  @Get('vehicles')
  @RequirePermission('reports.read')
  @ApiOperation({ summary: 'Get vehicles analytics (Section 53)' })
  async getVehiclesReport(@CurrentUser() user: any) {
    return this.reportsService.getVehiclesReport(user.organization_id);
  }

  @Get('work-orders')
  @RequirePermission('reports.read')
  @ApiOperation({ summary: 'Get work orders & financial reports (Section 53)' })
  async getWorkOrdersReport(@CurrentUser() user: any) {
    return this.reportsService.getWorkOrdersReport(user.organization_id);
  }
}
