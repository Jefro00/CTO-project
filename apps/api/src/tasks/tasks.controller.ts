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
import { TasksService } from './tasks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermission('tasks.read')
  @ApiOperation({ summary: 'List tasks (Section 47)' })
  async getTasks(
    @CurrentUser() user: any,
    @Query('assigned_to') assignedTo?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('location_id') locationId?: string,
    @Query('vehicle_id') vehicleId?: string,
  ) {
    const locId = user.location_scope === 'all_locations' ? locationId : user.location_id;
    return this.tasksService.getAll(user.organization_id, {
      assigned_to: assignedTo,
      status,
      priority,
      location_id: locId,
      vehicle_id: vehicleId,
    });
  }

  @Post()
  @RequirePermission('tasks.create')
  @ApiOperation({ summary: 'Create new task (Section 47)' })
  async createTask(@CurrentUser() user: any, @Body() body: any) {
    return this.tasksService.create(
      user.organization_id,
      user.id,
      user.location_id,
      body,
    );
  }

  @Get(':id')
  @RequirePermission('tasks.read')
  @ApiOperation({ summary: 'Get task details (Section 47)' })
  async getTask(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.getById(user.organization_id, id);
  }

  @Patch(':id')
  @RequirePermission('tasks.update')
  @ApiOperation({ summary: 'Update task (Section 47)' })
  async updateTask(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.tasksService.update(user.organization_id, id, body);
  }

  @Post(':id/complete')
  @RequirePermission('tasks.update')
  @ApiOperation({ summary: 'Complete task (Section 47)' })
  async completeTask(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tasksService.complete(user.organization_id, id);
  }
}
