import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowActionDto } from './dto/workflow-action.dto';
export declare class WorkflowController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    getWorkflows(): Promise<({
        stages: {
            id: string;
            name: string;
            orderIndex: number;
            approverRole: string | null;
            definitionId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
    })[]>;
    createWorkflow(dto: CreateWorkflowDto): Promise<{
        stages: {
            id: string;
            name: string;
            orderIndex: number;
            approverRole: string | null;
            definitionId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
    }>;
    getWorkflowById(id: string): Promise<{
        stages: {
            id: string;
            name: string;
            orderIndex: number;
            approverRole: string | null;
            definitionId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
    }>;
    updateWorkflow(id: string, dto: UpdateWorkflowDto): Promise<{
        stages: {
            id: string;
            name: string;
            orderIndex: number;
            approverRole: string | null;
            definitionId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
    }>;
    executeAction(id: string, dto: WorkflowActionDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        entityType: string;
        entityId: string;
        definitionId: string;
        currentStageId: string | null;
    }>;
    getWorkflowHistory(id: string, user: any): Promise<({
        actor: {
            id: string;
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        action: string;
        comments: string | null;
        instanceId: string;
        actorId: string;
    })[]>;
}
