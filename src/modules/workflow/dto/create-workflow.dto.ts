import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WorkflowStageDto {
  @ApiProperty({ example: 'Initial Review' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  orderIndex: number;

  @ApiProperty({ example: 'PRIMARY', description: 'Role required to approve this stage' })
  @IsString()
  @IsNotEmpty()
  approverRole: string;
}

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Two-Step Approval' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [WorkflowStageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStageDto)
  stages: WorkflowStageDto[];
}
