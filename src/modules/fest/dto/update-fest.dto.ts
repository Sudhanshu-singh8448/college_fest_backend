import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateFestDto {
  @ApiPropertyOptional({ example: 'TechGram 2026 — Updated' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 2026 })
  @Type(() => Number)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ example: '2026-10-15T09:00:00Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-17T18:00:00Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
