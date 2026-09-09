import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  @RequirePermission('roles.read')
  @ApiOperation({ summary: 'List all system permissions (Section 12)' })
  async getPermissions() {
    return this.db.all<any>('SELECT * FROM permissions ORDER BY code ASC');
  }
}
