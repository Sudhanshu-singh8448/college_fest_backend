import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Feedback category', example: 'EVENT', enum: ['EVENT', 'APP', 'ORGANIZER', 'GENERAL', 'BUG'] })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Detailed feedback content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Submit anonymously (userId will not be stored)', default: false })
  @IsBoolean()
  @IsOptional()
  anonymous?: boolean;
}
