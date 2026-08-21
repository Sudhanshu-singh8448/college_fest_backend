import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceTokenDto {
  @ApiProperty({ description: 'FCM device token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ enum: ['IOS', 'ANDROID', 'WEB'], example: 'ANDROID' })
  @IsString()
  @IsIn(['IOS', 'ANDROID', 'WEB'])
  platform: string;
}
