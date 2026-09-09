import {
  Controller,
  Get,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BackupsService } from './backups.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('backups')
@Controller('backups')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get()
  @RequirePermission('backup.create')
  @ApiOperation({ summary: 'List backups for organization (Section 52)' })
  async getBackups(@CurrentUser() user: any) {
    return this.backupsService.getAll(user.organization_id);
  }

  @Post()
  @RequirePermission('backup.create')
  @ApiOperation({ summary: 'Create full organization backup (Section 52 & 77-79)' })
  async createBackup(@CurrentUser() user: any, @Body() body: any) {
    return this.backupsService.create(user.organization_id, user.id, body?.type);
  }

  @Get(':id')
  @RequirePermission('backup.create')
  @ApiOperation({ summary: 'Get backup details and manifest (Section 52)' })
  async getBackup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.backupsService.getById(user.organization_id, id);
  }

  @Post(':id/restore')
  @RequirePermission('backup.restore')
  @ApiOperation({ summary: 'Restore organization from backup (Section 52)' })
  async restoreBackup(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.backupsService.restore(
      user.organization_id,
      id,
      body?.confirmationToken,
    );
  }
}
