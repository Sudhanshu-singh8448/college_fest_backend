import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
}

export class SendMessageDto {
  @ApiProperty({ description: 'Message text content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ enum: MessageType, default: 'TEXT' })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @ApiPropertyOptional({ description: 'ID of the message being replied to' })
  @IsString()
  @IsOptional()
  replyToId?: string;

  @ApiPropertyOptional({ description: 'Array of file attachment URLs' })
  @IsArray()
  @IsOptional()
  attachments?: { fileUrl: string; fileType: string; fileSize: number }[];
}
