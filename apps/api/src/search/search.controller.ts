import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across vehicles, customers, work orders, documents (Section 50)' })
  async search(@CurrentUser() user: any, @Query('q') q: string) {
    return this.searchService.search(user.organization_id, q || '');
  }
}
