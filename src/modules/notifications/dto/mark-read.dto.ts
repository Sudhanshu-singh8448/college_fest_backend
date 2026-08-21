import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiPropertyOptional({ description: 'Array of notification IDs to mark read. Omit to mark ALL as read.', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ids?: string[];
}
