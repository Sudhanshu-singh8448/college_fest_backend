import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('api/v1/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-url')
  @ApiOperation({
    summary: 'Request a pre-signed S3/R2 PUT URL for direct client-side upload',
    description:
      'Returns a signed URL valid for 10 minutes. Upload the file directly from the client to this URL. Then call /confirm.',
  })
  requestUploadUrl(@Body() dto: RequestUploadUrlDto, @CurrentUser() user: any) {
    return this.filesService.requestUploadUrl(user.id, dto);
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm a completed file upload',
    description:
      'Verifies the file exists in storage via HeadObject and marks the file record as CONFIRMED.',
  })
  confirmUpload(@Body() dto: ConfirmUploadDto, @CurrentUser() user: any) {
    return this.filesService.confirmUpload(user.id, dto);
  }

  @Get(':id/download-url')
  @ApiOperation({
    summary: 'Get a short-lived signed download URL (5 min)',
    description: 'Generates a pre-signed GET URL for private file access.',
  })
  getDownloadUrl(@Param('id') id: string, @CurrentUser() user: any) {
    return this.filesService.getDownloadUrl(id, user.id);
  }
}
