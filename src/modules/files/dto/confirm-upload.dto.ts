import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmUploadDto {
  @ApiProperty({ description: 'File ID returned from the upload-url endpoint' })
  @IsString()
  @IsNotEmpty()
  fileId: string;
}
