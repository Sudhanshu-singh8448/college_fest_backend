import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BroadcastDto {
  @ApiProperty({ description: 'Broadcast announcement title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Broadcast announcement body message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Priority: LOW, NORMAL, HIGH, URGENT', default: 'NORMAL' })
  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiPropertyOptional({ description: 'Optional specific event ID to target; if omitted, targets all events organized by the caller' })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Optional target club / category name' })
  @IsString()
  @IsOptional()
  category?: string;
}
