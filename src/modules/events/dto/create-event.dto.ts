import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ example: 'uuid-of-fest' })
  @IsString()
  @IsNotEmpty()
  festId: string;

  @ApiProperty({ example: 'Hackathon 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A 24-hour hackathon.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Technical' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: '2026-10-15T10:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-10-16T10:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Main Auditorium' })
  @IsString()
  @IsOptional()
  venue?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  maxParticipants?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  minTeamSize?: number;

  @ApiPropertyOptional({ example: 4, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxTeamSize?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsOptional()
  bannerUrl?: string;
}
