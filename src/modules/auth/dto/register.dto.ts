import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '2023ABCD1234' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiPropertyOptional({ example: 'student@college.edu' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
