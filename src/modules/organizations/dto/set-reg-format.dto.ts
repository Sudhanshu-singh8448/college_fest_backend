import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetRegFormatDto {
  @ApiProperty({ example: '^(\\d{4})(\\w{2})(\\w{2})(\\d{4})$', description: 'Regex pattern to parse registration numbers' })
  @IsString()
  @IsNotEmpty()
  regex: string;

  @ApiProperty({
    example: { '1': 'batch_year', '2': 'college_code', '3': 'branch_code', '4': 'roll_number' },
    description: 'Maps regex capture groups to their meaning',
  })
  @IsObject()
  formatMap: Record<string, string>;
}
