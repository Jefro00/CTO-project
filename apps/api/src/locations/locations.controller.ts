import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @RequirePermission('locations.read')
  @ApiOperation({ summary: 'List all branches/locations (Section 34)' })
  async getLocations(@CurrentUser() user: any) {
    return this.locationsService.getAll(user.organization_id);
  }

  @Post()
  @RequirePermission('locations.create')
  @ApiOperation({ summary: 'Create a new branch/location (Section 34)' })
  async createLocation(@CurrentUser() user: any, @Body() body: any) {
    return this.locationsService.create(user.organization_id, body);
  }

  @Get(':id')
  @RequirePermission('locations.read')
  @ApiOperation({ summary: 'Get branch/location details (Section 34)' })
  async getLocation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.locationsService.getById(user.organization_id, id);
  }

  @Patch(':id')
  @RequirePermission('locations.update')
  @ApiOperation({ summary: 'Update branch/location details (Section 34)' })
  async updateLocation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.locationsService.update(user.organization_id, id, body);
  }

  @Delete(':id')
  @RequirePermission('locations.delete')
  @ApiOperation({ summary: 'Delete branch/location (Section 34)' })
  async deleteLocation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.locationsService.delete(user.organization_id, id);
  }
}
