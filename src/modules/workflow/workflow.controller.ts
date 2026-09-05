import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowActionDto } from './dto/workflow-action.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Workflow')
@ApiBearerAuth()
@Controller('api/v1')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('workflows')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('workflow:configure')
  @ApiOperation({ summary: 'List all workflows (requires workflow:configure)' })
  async getWorkflows() {
    return this.workflowService.getWorkflows();
  }

  @Post('workflows')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('workflow:configure')
  @ApiOperation({
    summary: 'Create a new workflow (requires workflow:configure)',
  })
  async createWorkflow(@Body() dto: CreateWorkflowDto) {
    return this.workflowService.createWorkflow(dto);
  }

  @Get('workflows/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('workflow:configure')
  @ApiOperation({
    summary: 'Get workflow details (requires workflow:configure)',
  })
  async getWorkflowById(@Param('id') id: string) {
    return this.workflowService.getWorkflowById(id);
  }

  @Patch('workflows/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('workflow:configure')
  @ApiOperation({ summary: 'Update workflow (requires workflow:configure)' })
  async updateWorkflow(
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflowService.updateWorkflow(id, dto);
  }

  @Post('workflow-instances/:id/action')
  @ApiOperation({
    summary: 'Execute an action on a workflow instance (approvers only)',
  })
  async executeAction(
    @Param('id') id: string,
    @Body() dto: WorkflowActionDto,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('workflow:manage_all');
    return this.workflowService.executeAction(id, dto, user.id, hasGlobalPerm);
  }

  @Get('workflow-instances/:id/history')
  @ApiOperation({ summary: 'Get workflow history' })
  async getWorkflowHistory(@Param('id') id: string, @CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('workflow:manage_all');
    return this.workflowService.getWorkflowHistory(id, user.id, hasGlobalPerm);
  }
}
