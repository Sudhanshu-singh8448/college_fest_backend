import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiPropertyOptional({ example: 'CSE 2024 Batch - Updated' })
  @IsString()
  @IsOptional()
  name?: string;
}
