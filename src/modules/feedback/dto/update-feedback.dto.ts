import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ enum: ['REVIEWED', 'RESOLVED', 'DISMISSED'] })
  @IsString()
  @IsIn(['REVIEWED', 'RESOLVED', 'DISMISSED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Admin response message' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  adminResponse?: string;
}
