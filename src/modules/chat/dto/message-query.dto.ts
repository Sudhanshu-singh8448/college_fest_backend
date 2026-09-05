import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MessageQueryDto {
  @ApiPropertyOptional({
    description: 'Cursor-based pagination: message ID before which to fetch',
    example: 'uuid-of-last-message',
  })
  @IsString()
  @IsOptional()
  before?: string;

  @ApiPropertyOptional({
    description: 'Number of messages to return',
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 30;
}
