import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFestDto {
  @ApiProperty({ example: 'TechGram 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  year: number;

  @ApiProperty({ example: '2026-10-15T09:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-10-17T18:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
