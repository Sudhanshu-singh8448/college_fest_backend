import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
