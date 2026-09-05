import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ExpenseQueryDto {
  @ApiPropertyOptional({
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'],
  })
  @IsString()
  @IsIn(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by event ID' })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
