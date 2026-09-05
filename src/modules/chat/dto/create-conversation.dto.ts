import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export class CreateConversationDto {
  @ApiProperty({ enum: ConversationType, example: 'DIRECT' })
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiPropertyOptional({ description: 'Group name (required for GROUP type)' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Array of user IDs to add (required for DIRECT)',
    example: ['uuid-of-user'],
  })
  @IsOptional()
  memberIds?: string[];
}
