import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGuidelinesDto {
  @ApiProperty({ example: '# Fest Guidelines\n\n1. Be on time\n2. Carry your ID\n...' })
  @IsString()
  @IsNotEmpty()
  guidelines: string;
}
