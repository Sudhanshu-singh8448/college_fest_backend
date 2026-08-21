import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventStatusDto {
  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'STARTED', 'COMPLETED', 'ARCHIVED'] })
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'STARTED', 'COMPLETED', 'ARCHIVED'])
  status: string;
}
