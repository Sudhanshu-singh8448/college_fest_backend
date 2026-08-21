import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExpenseStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED', 'NEEDS_REVISION', 'PENDING'], example: 'APPROVED' })
  @IsString()
  @IsIn(['APPROVED', 'REJECTED', 'NEEDS_REVISION', 'PENDING'])
  status: string;

  @ApiPropertyOptional({ description: 'Required when status is REJECTED or NEEDS_REVISION' })
  @IsString()
  @IsOptional()
  comment?: string;
}
