import {
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WinnerEntryDto {
  @ApiProperty({ description: 'User ID of the winner' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Position (1 = 1st place, 2 = 2nd, etc.)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  position: number;

  @ApiPropertyOptional({
    description: 'Prize description',
    example: 'Cash Prize ₹5000',
  })
  @IsString()
  @IsOptional()
  prize?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the win' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class SetEventWinnersDto {
  @ApiProperty({
    type: [WinnerEntryDto],
    description: 'Array of winners. Replaces existing winners for this event.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WinnerEntryDto)
  winners: WinnerEntryDto[];
}
