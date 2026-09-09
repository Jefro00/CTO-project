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
import { RolesService } from './roles.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermission('roles.read')
  @ApiOperation({ summary: 'List all roles with permissions (Section 36)' })
  async getRoles(@CurrentUser() user: any) {
    return this.rolesService.getAll(user.organization_id);
  }

  @Post()
  @RequirePermission('roles.update')
  @ApiOperation({ summary: 'Create custom role (Section 36)' })
  async createRole(@CurrentUser() user: any, @Body() body: any) {
    return this.rolesService.create(user.organization_id, body);
  }

  @Get(':id')
  @RequirePermission('roles.read')
  @ApiOperation({ summary: 'Get role details (Section 36)' })
  async getRole(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rolesService.getById(user.organization_id, id);
  }

  @Patch(':id')
  @RequirePermission('roles.update')
  @ApiOperation({ summary: 'Update role permissions (Section 36)' })
  async updateRole(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.rolesService.update(user.organization_id, id, body);
  }

  @Delete(':id')
  @RequirePermission('roles.update')
  @ApiOperation({ summary: 'Delete role (Section 36)' })
  async deleteRole(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rolesService.delete(user.organization_id, id);
  }
}
