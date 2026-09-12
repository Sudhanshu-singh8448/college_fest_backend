import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class EventQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Search by event name or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by fest ID' })
  @IsString()
  @IsOptional()
  festId?: string;

  @ApiPropertyOptional({ description: 'Filter by organizer user ID' })
  @IsString()
  @IsOptional()
  organizerId?: string;

  @ApiPropertyOptional({ description: 'Filter by currently logged-in user events' })
  @IsOptional()
  myEvents?: boolean | string;
}
