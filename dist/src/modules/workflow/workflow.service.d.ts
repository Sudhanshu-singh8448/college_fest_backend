import { PrismaService } from '../../database/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowActionDto } from './dto/workflow-action.dto';
export declare class WorkflowService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    startWorkflowInstance(definitionId: string, entityType: string, entityId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        entityType: string;
        entityId: string;
        definitionId: string;
        currentStageId: string | null;
    }>;
    executeAction(instanceId: string, dto: WorkflowActionDto, actorId: string, hasGlobalPerm: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        entityType: string;
        entityId: string;
        definitionId: string;
        currentStageId: string | null;
    }>;
    getWorkflowHistory(instanceId: string, userId: string, hasGlobalPerm: boolean): Promise<({
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
