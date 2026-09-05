import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export type UploadPurpose =
  | 'avatar'
  | 'event_banner'
  | 'chat_image'
  | 'chat_video'
  | 'document'
  | 'receipt';

export const UPLOAD_LIMITS_MB: Record<UploadPurpose, number> = {
  avatar: 5,
  event_banner: 10,
  chat_image: 15,
  chat_video: 50,
  document: 25,
  receipt: 10,
};

export class RequestUploadUrlDto {
  @ApiProperty({
    enum: [
      'avatar',
      'event_banner',
      'chat_image',
      'chat_video',
      'document',
      'receipt',
    ],
  })
  @IsString()
  @IsIn([
    'avatar',
    'event_banner',
    'chat_image',
    'chat_video',
    'document',
    'receipt',
  ])
  purpose: UploadPurpose;

  @ApiProperty({
    description: 'MIME type of the file (e.g. image/jpeg, video/mp4)',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  size: number;

  @ApiPropertyOptional({ description: 'Original file name' })
  @IsString()
  @IsOptional()
  fileName?: string;
}
