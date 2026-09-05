import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferenceDto {
  @ApiPropertyOptional({
    description:
      'Notification type key, e.g. CHAT_MESSAGE, REGISTRATION_APPROVED',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  inAppEnabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'Array of preference updates',
    type: [UpdatePreferenceDto],
  })
  preferences: UpdatePreferenceDto[];
}
