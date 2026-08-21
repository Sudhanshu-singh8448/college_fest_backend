import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyQrDto {
  @ApiProperty({ description: 'The scanned QR JWT token' })
  @IsString()
  @IsNotEmpty()
  qrToken: string;
}
