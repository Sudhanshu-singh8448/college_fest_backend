import { IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Key-value map of settings to update',
    example: {
      'fest.registrationOpen': 'true',
      'app.maintenanceMode': 'false',
      'app.maxGroupSize': '50',
    },
  })
  @IsObject()
  @IsNotEmpty()
  settings: Record<string, string>;
}
