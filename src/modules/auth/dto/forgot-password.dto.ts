import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: '2023ABCD1234' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;
}
