import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({ example: 'SUSPENDED', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] })
  @IsString()
  @IsIn(['ACTIVE', 'SUSPENDED', 'BANNED'])
  status: string;
}
