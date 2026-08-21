import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddOrganizerDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'PRIMARY', enum: ['PRIMARY', 'SECONDARY'] })
  @IsString()
  @IsIn(['PRIMARY', 'SECONDARY'])
  role: string;
}
