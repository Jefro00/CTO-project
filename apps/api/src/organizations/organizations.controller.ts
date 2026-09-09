import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('organization')
@Controller('organization')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current organization details (Section 33)' })
  async getOrganization(@CurrentUser() user: any) {
    return this.orgService.getOrganization(user.organization_id);
  }

  @Patch()
  @RequirePermission('organization.update')
  @ApiOperation({ summary: 'Update organization details (Section 33)' })
  async updateOrganization(@CurrentUser() user: any, @Body() body: any) {
    return this.orgService.updateOrganization(user.organization_id, body);
  }
}
