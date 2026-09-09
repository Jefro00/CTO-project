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
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'List all users in organization (Section 35)' })
  async getUsers(
    @CurrentUser() user: any,
    @Query('location_id') locationId?: string,
  ) {
    const locId = user.location_scope === 'all_locations' ? locationId : user.location_id;
    return this.usersService.getAll(user.organization_id, locId);
  }

  @Post()
  @RequirePermission('users.create')
  @ApiOperation({ summary: 'Create user (Section 35)' })
  async createUser(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.create(user.organization_id, body);
  }

  @Get(':id')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Get user details (Section 35)' })
  async getUser(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.getById(user.organization_id, id);
  }

  @Patch(':id')
  @RequirePermission('users.update')
  @ApiOperation({ summary: 'Update user (Section 35)' })
  async updateUser(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.usersService.update(user.organization_id, id, body);
  }

  @Delete(':id')
  @RequirePermission('users.delete')
  @ApiOperation({ summary: 'Delete user (Section 35)' })
  async deleteUser(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.delete(user.organization_id, id, user.role_name);
  }
}
