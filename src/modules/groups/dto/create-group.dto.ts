import { IsString, IsNotEmpty, IsOptional, IsIn, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'CSE 2024 Batch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CUSTOM', enum: ['SYSTEM', 'CUSTOM', 'EVENT'] })
  @IsString()
  @IsIn(['SYSTEM', 'CUSTOM', 'EVENT'])
  type: string;

  @ApiPropertyOptional({
    example: { branch_code: 'CS', batch_year: '2024' },
    description: 'Auto-assign rule for SYSTEM groups (JSONB)',
  })
  @IsObject()
  @IsOptional()
  autoAssignRule?: Record<string, any>;
}
