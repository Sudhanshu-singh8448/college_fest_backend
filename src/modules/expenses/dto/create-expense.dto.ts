import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Category ID' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Event this expense belongs to (optional)',
  })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiProperty({ description: 'Amount in INR', example: 1500.0 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: 'Description of the expense' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'File ID of uploaded receipt (from /files/confirm)',
  })
  @IsString()
  @IsOptional()
  receiptFileId?: string;

  @ApiPropertyOptional({
    description: 'Submit immediately to PENDING (default: save as DRAFT)',
    default: false,
  })
  @IsOptional()
  submit?: boolean;
}
