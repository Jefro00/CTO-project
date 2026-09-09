import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-url')
  @RequirePermission('media.upload')
  @ApiOperation({ summary: 'Generate presigned upload URL (Section 42)' })
  async generateUploadUrl(@CurrentUser() user: any, @Body() body: any) {
    return this.mediaService.generateUploadUrl(
      user.organization_id,
      user.id,
      user.location_id,
      body,
    );
  }

  @Post(':id/complete')
  @RequirePermission('media.upload')
  @ApiOperation({ summary: 'Complete media upload and attach metadata/damage markers (Section 42 & 67)' })
  async completeUpload(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.mediaService.completeUpload(user.organization_id, id, body);
  }

  @Get(':id')
  @RequirePermission('media.read')
  @ApiOperation({ summary: 'Get media metadata (Section 43)' })
  async getMedia(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mediaService.getById(user.organization_id, id);
  }

  @Get(':id/download-url')
  @RequirePermission('media.read')
  @ApiOperation({ summary: 'Get temporary download URL (Section 43)' })
  async getDownloadUrl(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mediaService.getDownloadUrl(user.organization_id, id);
  }

  @Delete(':id')
  @RequirePermission('media.delete')
  @ApiOperation({ summary: 'Delete media (Section 43)' })
  async deleteMedia(@CurrentUser() user: any, @Param('id') id: string) {
    return this.mediaService.delete(user.organization_id, id);
  }
}
