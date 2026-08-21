import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiPropertyOptional({ description: 'Updated message content', maxLength: 4096 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  @IsOptional()
  content?: string;
}
