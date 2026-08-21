import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkflowActionDto {
  @ApiProperty({ example: 'APPROVE', enum: ['APPROVE', 'REJECT', 'RETURN', 'ESCALATE', 'SKIP'] })
  @IsString()
  @IsIn(['APPROVE', 'REJECT', 'RETURN', 'ESCALATE', 'SKIP'])
  action: string;

  @ApiPropertyOptional({ example: 'Looks good to me.' })
  @IsString()
  @IsOptional()
  comments?: string;
}
