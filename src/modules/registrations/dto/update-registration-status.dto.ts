import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRegistrationStatusDto {
  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED', 'CANCELLED', 'CHECKED_IN', 'COMPLETED'] })
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED', 'CANCELLED', 'CHECKED_IN', 'COMPLETED'])
  status: string;

  @ApiPropertyOptional({ description: 'Required if status is REJECTED', example: 'Does not meet minimum requirements.' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
