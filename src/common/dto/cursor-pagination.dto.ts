import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Cursor (last item ID) for next page' })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({ minimum: 1, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
