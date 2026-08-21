import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ description: 'The scanned QR JWT token' })
  @IsString()
  @IsNotEmpty()
  qrToken: string;

  @ApiProperty({ description: 'Event ID for which the check-in is happening' })
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
