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
import { RemindersService } from './reminders.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('reminders')
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  @RequirePermission('reminders.read')
  @ApiOperation({ summary: 'List maintenance reminders (Section 48)' })
  async getReminders(
    @CurrentUser() user: any,
    @Query('vehicle_id') vehicleId?: string,
    @Query('customer_id') customerId?: string,
    @Query('status') status?: string,
  ) {
    return this.remindersService.getAll(user.organization_id, {
      vehicle_id: vehicleId,
      customer_id: customerId,
      status,
    });
  }

  @Post()
  @RequirePermission('reminders.create')
  @ApiOperation({ summary: 'Create maintenance reminder (Section 48)' })
  async createReminder(@CurrentUser() user: any, @Body() body: any) {
    return this.remindersService.create(
      user.organization_id,
      user.id,
      user.location_id,
      body,
    );
  }

  @Get(':id')
  @RequirePermission('reminders.read')
  @ApiOperation({ summary: 'Get reminder details (Section 48)' })
  async getReminder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.remindersService.getById(user.organization_id, id);
  }

  @Patch(':id')
  @RequirePermission('reminders.update')
  @ApiOperation({ summary: 'Update reminder (Section 48)' })
  async updateReminder(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.remindersService.update(user.organization_id, id, body);
  }

  @Post(':id/complete')
  @RequirePermission('reminders.update')
  @ApiOperation({ summary: 'Mark reminder completed (Section 48)' })
  async completeReminder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.remindersService.complete(user.organization_id, id);
  }
}
