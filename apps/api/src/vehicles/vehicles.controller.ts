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
import { VehiclesService } from './vehicles.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('search')
  @RequirePermission('vehicles.read')
  @ApiOperation({ summary: 'Search vehicles by VIN, license plate, customer phone or name (Section 38)' })
  async searchVehicles(@CurrentUser() user: any, @Query('q') q: string) {
    return this.vehiclesService.search(user.organization_id, q || '');
  }

  @Get(':id/history')
  @RequirePermission('vehicles.read')
  @ApiOperation({ summary: 'Get aggregated vehicle timeline history (Section 39)' })
  async getVehicleHistory(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.vehiclesService.getHistory(user.organization_id, id, { page, limit });
  }

  @Get()
  @RequirePermission('vehicles.read')
  @ApiOperation({ summary: 'List vehicles with pagination & filtering (Section 38 & 57)' })
  async getVehicles(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('make') make?: string,
    @Query('model') model?: string,
    @Query('year') year?: number,
    @Query('license_plate') licensePlate?: string,
    @Query('vin') vin?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.vehiclesService.getAll(user.organization_id, {
      page,
      limit,
      make,
      model,
      year,
      license_plate: licensePlate,
      vin,
      status,
      search,
    });
  }

  @Post()
  @RequirePermission('vehicles.create')
  @ApiOperation({ summary: 'Register new vehicle (Section 38)' })
  async createVehicle(@CurrentUser() user: any, @Body() body: any) {
    return this.vehiclesService.create(user.organization_id, body);
  }

  @Get(':id')
  @RequirePermission('vehicles.read')
  @ApiOperation({ summary: 'Get vehicle details (Section 38)' })
  async getVehicle(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vehiclesService.getById(user.organization_id, id);
  }

  @Patch(':id')
  @RequirePermission('vehicles.update')
  @ApiOperation({ summary: 'Update vehicle information (Section 38)' })
  async updateVehicle(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.vehiclesService.update(user.organization_id, id, body);
  }

  @Delete(':id')
  @RequirePermission('vehicles.delete')
  @ApiOperation({ summary: 'Delete vehicle (Section 38)' })
  async deleteVehicle(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vehiclesService.delete(user.organization_id, id);
  }
}
