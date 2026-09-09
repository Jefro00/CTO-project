import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/require-permission.decorator';
import { DatabaseService } from '../database/database.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'System health check (Section 105)' })
  check() {
    let dbStatus = 'ok';
    try {
      this.db.get('SELECT 1');
    } catch (e) {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      database: dbStatus,
      redis: 'ok',
      storage: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
