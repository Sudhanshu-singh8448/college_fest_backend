import { IsString, IsDateString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Hackathon 2026' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'A 24-hour hackathon.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Technical' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: '2026-10-15T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-16T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Main Auditorium' })
  @IsString()
  @IsOptional()
  venue?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  maxParticipants?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  minTeamSize?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxTeamSize?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsOptional()
  bannerUrl?: string;
}
