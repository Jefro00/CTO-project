import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @RequirePermission('documents.read')
  @ApiOperation({ summary: 'List documents (Section 46)' })
  async getDocuments(
    @CurrentUser() user: any,
    @Query('vehicle_id') vehicleId?: string,
    @Query('work_order_id') workOrderId?: string,
    @Query('customer_id') customerId?: string,
    @Query('type') type?: string,
  ) {
    return this.documentsService.getAll(user.organization_id, {
      vehicle_id: vehicleId,
      work_order_id: workOrderId,
      customer_id: customerId,
      type,
    });
  }

  @Post('generate')
  @RequirePermission('documents.create')
  @ApiOperation({ summary: 'Generate printable document (Work order, Act, Invoice) (Section 46)' })
  async generateDocument(@CurrentUser() user: any, @Body() body: any) {
    return this.documentsService.generate(user.organization_id, user.id, body);
  }

  @Post()
  @RequirePermission('documents.create')
  @ApiOperation({ summary: 'Upload/register document (Section 46)' })
  async createDocument(@CurrentUser() user: any, @Body() body: any) {
    return this.documentsService.create(user.organization_id, user.id, body);
  }

  @Get(':id')
  @RequirePermission('documents.read')
  @ApiOperation({ summary: 'Get document details (Section 46)' })
  async getDocument(@CurrentUser() user: any, @Param('id') id: string) {
    return this.documentsService.getById(user.organization_id, id);
  }

  @Get(':id/download-url')
  @RequirePermission('documents.read')
  @ApiOperation({ summary: 'Get document download URL (Section 46)' })
  async getDownloadUrl(@CurrentUser() user: any, @Param('id') id: string) {
    const doc = this.documentsService.getById(user.organization_id, id);
    return {
      documentId: doc.id,
      name: doc.name,
      downloadUrl: `/api/v1/documents/${doc.id}`,
    };
  }

  @Delete(':id')
  @RequirePermission('documents.delete')
  @ApiOperation({ summary: 'Delete document (Section 46)' })
  async deleteDocument(@CurrentUser() user: any, @Param('id') id: string) {
    return this.documentsService.delete(user.organization_id, id);
  }
}
