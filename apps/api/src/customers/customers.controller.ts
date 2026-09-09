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
import { CustomersService } from './customers.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('search')
  @RequirePermission('customers.read')
  @ApiOperation({ summary: 'Search customers by name/phone/email (Section 37)' })
  async searchCustomers(@CurrentUser() user: any, @Query('q') q: string) {
    return this.customersService.search(user.organization_id, q || '');
  }

  @Get()
  @RequirePermission('customers.read')
  @ApiOperation({ summary: 'List customers with pagination (Section 37)' })
  async getCustomers(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.customersService.getAll(user.organization_id, { page, limit, search });
  }

  @Post()
  @RequirePermission('customers.create')
  @ApiOperation({ summary: 'Create customer (Section 37)' })
  async createCustomer(@CurrentUser() user: any, @Body() body: any) {
    return this.customersService.create(user.organization_id, body);
  }

  @Get(':id')
  @RequirePermission('customers.read')
  @ApiOperation({ summary: 'Get customer details (Section 37)' })
  async getCustomer(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customersService.getById(user.organization_id, id);
  }

  @Patch(':id')
  @RequirePermission('customers.update')
  @ApiOperation({ summary: 'Update customer (Section 37)' })
  async updateCustomer(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.customersService.update(user.organization_id, id, body);
  }

  @Delete(':id')
  @RequirePermission('customers.delete')
  @ApiOperation({ summary: 'Delete customer (Section 37)' })
  async deleteCustomer(@CurrentUser() user: any, @Param('id') id: string) {
    return this.customersService.delete(user.organization_id, id);
  }
}
