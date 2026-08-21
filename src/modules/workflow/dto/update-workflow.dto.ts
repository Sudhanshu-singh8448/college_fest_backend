import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WorkflowStageDto } from './create-workflow.dto';

export class UpdateWorkflowDto {
  @ApiPropertyOptional({ example: 'Updated Two-Step Approval' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ type: [WorkflowStageDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStageDto)
  stages?: WorkflowStageDto[];
}
