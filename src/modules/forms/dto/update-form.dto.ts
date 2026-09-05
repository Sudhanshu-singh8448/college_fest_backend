import {
  IsArray,
  ValidateNested,
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormFieldValidationDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  min?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  max?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pattern?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  allowed_types?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  max_size_mb?: number;
}

export class FormFieldDto {
  @ApiProperty({ example: 'team_name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Team Name' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    example: 'text',
    enum: [
      'text',
      'number',
      'email',
      'phone',
      'dropdown',
      'radio',
      'checkbox',
      'date',
      'file',
      'image',
      'textarea',
      'url',
      'team_member',
    ],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => FormFieldValidationDto)
  validation?: FormFieldValidationDto;
}

export class UpdateFormDto {
  @ApiProperty({ type: [FormFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  schema: FormFieldDto[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
