import { IsString, IsOptional, IsPhoneNumber, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Software Developer' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}
