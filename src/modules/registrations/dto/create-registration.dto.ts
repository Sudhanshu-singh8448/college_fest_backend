import { IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRegistrationDto {
  @ApiPropertyOptional({
    description: 'JSON object containing form answers',
    example: { team_name: 'TechTitans', members: ['A', 'B'] },
  })
  @IsObject()
  @IsOptional()
  answers?: Record<string, any>;
}
