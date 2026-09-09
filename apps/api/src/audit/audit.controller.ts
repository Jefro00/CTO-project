import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission('audit.read')
  @ApiOperation({ summary: 'List immutable audit logs (Section 51 & 26)' })
  async getLogs(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('entity_type') entityType?: string,
    @Query('action') action?: string,
  ) {
    return this.auditService.getAll(user.organization_id, {
      page,
      limit,
      entity_type: entityType,
      action,
    });
  }

  @Get(':id')
  @RequirePermission('audit.read')
  @ApiOperation({ summary: 'Get audit log details (Section 51)' })
  async getLog(@CurrentUser() user: any, @Param('id') id: string) {
    return this.auditService.getById(user.organization_id, id);
  }
}
