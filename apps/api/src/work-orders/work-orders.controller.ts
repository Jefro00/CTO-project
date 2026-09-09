import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('work-orders')
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @RequirePermission('work_orders.read')
  @ApiOperation({ summary: 'List work orders (Section 44)' })
  async getWorkOrders(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('location_id') locationId?: string,
    @Query('vehicle_id') vehicleId?: string,
    @Query('customer_id') customerId?: string,
    @Query('search') search?: string,
  ) {
    const locId = user.location_scope === 'all_locations' ? locationId : user.location_id;
    return this.workOrdersService.getAll(user.organization_id, {
      page,
      limit,
      status,
      location_id: locId,
      vehicle_id: vehicleId,
      customer_id: customerId,
      search,
    });
  }

  @Post()
  @RequirePermission('work_orders.create')
  @ApiOperation({ summary: 'Create new work order (Section 44)' })
  async createWorkOrder(@CurrentUser() user: any, @Body() body: any) {
    return this.workOrdersService.create(
      user.organization_id,
      user.id,
      user.location_id,
      body,
    );
  }

  @Get(':id')
  @RequirePermission('work_orders.read')
  @ApiOperation({ summary: 'Get work order details with items (Section 44)' })
  async getWorkOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workOrdersService.getById(user.organization_id, id);
  }

  @Patch(':id')
  @RequirePermission('work_orders.update')
  @ApiOperation({ summary: 'Update work order (Section 44)' })
  async updateWorkOrder(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.workOrdersService.update(user.organization_id, id, body);
  }

  @Post(':id/approve')
  @RequirePermission('work_orders.update')
  @ApiOperation({ summary: 'Approve work order (Section 44)' })
  async approveWorkOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workOrdersService.approve(user.organization_id, id);
  }

  @Post(':id/start')
  @RequirePermission('work_orders.update')
  @ApiOperation({ summary: 'Start work on work order (Section 44)' })
  async startWorkOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workOrdersService.start(user.organization_id, id);
  }

  @Post(':id/complete')
  @RequirePermission('work_orders.update')
  @ApiOperation({ summary: 'Complete work order (Section 44)' })
  async completeWorkOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workOrdersService.complete(user.organization_id, id);
  }

  @Post(':id/close')
  @RequirePermission('work_orders.close')
  @ApiOperation({ summary: 'Close and finalize work order (Section 44)' })
  async closeWorkOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workOrdersService.close(user.organization_id, id);
  }

  @Post(':id/cancel')
  @RequirePermission('work_orders.update')
  @ApiOperation({ summary: 'Cancel work order (Section 44)' })
  async cancelWorkOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workOrdersService.cancel(user.organization_id, id);
  }

  @Get(':id/items')
  @RequirePermission('work_order_items.read')
  @ApiOperation({ summary: 'Get work order items (Section 45)' })
  async getItems(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workOrdersService.getItems(user.organization_id, id);
  }

  @Post(':id/items')
  @RequirePermission('work_order_items.create')
  @ApiOperation({ summary: 'Add item (labor or part) to work order (Section 45)' })
  async addItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.workOrdersService.addItem(user.organization_id, id, body);
  }

  @Patch(':id/items/:itemId')
  @RequirePermission('work_order_items.update')
  @ApiOperation({ summary: 'Update work order item (Section 45)' })
  async updateItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: any,
  ) {
    return this.workOrdersService.updateItem(user.organization_id, id, itemId, body);
  }

  @Delete(':id/items/:itemId')
  @RequirePermission('work_order_items.delete')
  @ApiOperation({ summary: 'Delete work order item (Section 45)' })
  async deleteItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.workOrdersService.deleteItem(user.organization_id, id, itemId);
  }
}
