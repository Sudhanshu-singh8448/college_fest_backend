import { IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationDto {
  @ApiProperty({
    description: 'JSON object containing form answers',
    example: { team_name: 'TechTitans', members: ['A', 'B'] },
  })
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, any>;
}
