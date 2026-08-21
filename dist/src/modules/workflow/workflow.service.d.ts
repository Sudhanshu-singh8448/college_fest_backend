import { PrismaService } from '../../database/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowActionDto } from './dto/workflow-action.dto';
export declare class WorkflowService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWorkflows(): Promise<({
        stages: {
            name: string;
            id: string;
            orderIndex: number;
            approverRole: string | null;
            definitionId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
    })[]>;
    createWorkflow(dto: CreateWorkflowDto): Promise<{
        stages: {
            name: string;
            id: string;
            orderIndex: number;
            approverRole: string | null;
            definitionId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
    }>;
    getWorkflowById(id: string): Promise<{
        stages: {
            name: string;
            id: string;
            orderIndex: number;
            approverRole: string | null;
            definitionId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
    }>;
    updateWorkflow(id: string, dto: UpdateWorkflowDto): Promise<{
        stages: {
            name: string;
            id: string;
            orderIndex: number;
            approverRole: string | null;
            definitionId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
    }>;
    startWorkflowInstance(definitionId: string, entityType: string, entityId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        entityType: string;
        entityId: string;
        definitionId: string;
        currentStageId: string | null;
    }>;
    executeAction(instanceId: string, dto: WorkflowActionDto, actorId: string, hasGlobalPerm: boolean): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        entityType: string;
        entityId: string;
        definitionId: string;
        currentStageId: string | null;
    }>;
    getWorkflowHistory(instanceId: string, userId: string, hasGlobalPerm: boolean): Promise<({
        actor: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
            id: string;
        };
    } & {
        comments: string | null;
        id: string;
        createdAt: Date;
        action: string;
        instanceId: string;
        actorId: string;
    })[]>;
}
