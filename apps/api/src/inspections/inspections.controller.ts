import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InspectionsService } from './inspections.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('inspections')
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get()
  @RequirePermission('inspections.read')
  @ApiOperation({ summary: 'List inspections (Section 40)' })
  async getInspections(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('location_id') locationId?: string,
    @Query('vehicle_id') vehicleId?: string,
  ) {
    const locId = user.location_scope === 'all_locations' ? locationId : user.location_id;
    return this.inspectionsService.getAll(user.organization_id, {
      page,
      limit,
      status,
      location_id: locId,
      vehicle_id: vehicleId,
    });
  }

  @Post()
  @RequirePermission('inspections.create')
  @ApiOperation({ summary: 'Create new inspection (Section 40)' })
  async createInspection(@CurrentUser() user: any, @Body() body: any) {
    return this.inspectionsService.create(
      user.organization_id,
      user.id,
      user.location_id,
      body,
    );
  }

  @Get(':id')
  @RequirePermission('inspections.read')
  @ApiOperation({ summary: 'Get inspection details (Section 40)' })
  async getInspection(@CurrentUser() user: any, @Param('id') id: string) {
    return this.inspectionsService.getById(user.organization_id, id);
  }

  @Patch(':id')
  @RequirePermission('inspections.update')
  @ApiOperation({ summary: 'Update inspection details (Section 40)' })
  async updateInspection(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.inspectionsService.update(user.organization_id, id, body);
  }

  @Post(':id/complete')
  @RequirePermission('inspections.update')
  @ApiOperation({ summary: 'Complete inspection (Section 40)' })
  async completeInspection(@CurrentUser() user: any, @Param('id') id: string) {
    return this.inspectionsService.complete(user.organization_id, id);
  }

  @Post(':id/cancel')
  @RequirePermission('inspections.update')
  @ApiOperation({ summary: 'Cancel inspection (Section 40)' })
  async cancelInspection(@CurrentUser() user: any, @Param('id') id: string) {
    return this.inspectionsService.cancel(user.organization_id, id);
  }

  @Get(':id/items')
  @RequirePermission('inspections.read')
  @ApiOperation({ summary: 'Get inspection checklist items (Section 41)' })
  async getItems(@CurrentUser() user: any, @Param('id') id: string) {
    return this.inspectionsService.getItems(user.organization_id, id);
  }

  @Post(':id/items')
  @RequirePermission('inspections.update')
  @ApiOperation({ summary: 'Add checklist item (Section 41)' })
  async addItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.inspectionsService.addItem(user.organization_id, id, body);
  }

  @Patch(':id/items/:itemId')
  @RequirePermission('inspections.update')
  @ApiOperation({ summary: 'Update checklist item status/comment (Section 41)' })
  async updateItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: any,
  ) {
    return this.inspectionsService.updateItem(user.organization_id, id, itemId, body);
  }
}
