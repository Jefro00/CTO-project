import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user (Section 49)' })
  async getNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getAll(user.organization_id, user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read (Section 49)' })
  async markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.organization_id, user.id, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read (Section 49)' })
  async markAllRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.organization_id, user.id);
  }
}
