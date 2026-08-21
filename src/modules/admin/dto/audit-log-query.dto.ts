import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AuditLogQueryDto {
  @ApiPropertyOptional({ description: 'Filter by actor user ID' })
  @IsString()
  @IsOptional()
  actorId?: string;

  @ApiPropertyOptional({ description: 'Filter by action (e.g. UPDATE_EXPENSE_STATUS)' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({ description: 'Filter by resource type (e.g. Expense, EventRegistration)' })
  @IsString()
  @IsOptional()
  resourceType?: string;

  @ApiPropertyOptional({ description: 'Filter by resource ID' })
  @IsString()
  @IsOptional()
  resourceId?: string;

  @ApiPropertyOptional({ description: 'From date (ISO 8601)', example: '2025-01-01T00:00:00Z' })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'To date (ISO 8601)', example: '2025-12-31T23:59:59Z' })
  @IsString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}
