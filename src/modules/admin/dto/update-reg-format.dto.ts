import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRegNumberFormatDto {
  @ApiProperty({
    description:
      'Registration number format string. Use {YEAR}, {BRANCH}, {BATCH}, {SEQ} as placeholders.',
    example: 'TG-{YEAR}-{BRANCH}-{SEQ:4}',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9\-_{}:]+$/, {
    message:
      'Format may only contain uppercase letters, digits, hyphens, underscores, and {PLACEHOLDER} tokens',
  })
  format: string;

  @ApiProperty({ description: 'Preview prefix (e.g. TG)', example: 'TG' })
  @IsString()
  @IsNotEmpty()
  prefix: string;
}
