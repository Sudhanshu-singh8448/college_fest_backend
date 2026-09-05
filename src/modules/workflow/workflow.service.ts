import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowActionDto } from './dto/workflow-action.dto';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /workflows ──────────────────────────────
  async getWorkflows() {
    return this.prisma.workflowDefinition.findMany({
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  // ── POST /workflows ─────────────────────────────
  async createWorkflow(dto: CreateWorkflowDto) {
    return this.prisma.workflowDefinition.create({
      data: {
        name: dto.name,
        stages: {
          create: dto.stages.map((stage) => ({
            name: stage.name,
            orderIndex: stage.orderIndex,
            approverRole: stage.approverRole,
          })),
        },
      },
      include: { stages: true },
    });
  }

  // ── GET /workflows/:id ──────────────────────────
  async getWorkflowById(id: string) {
    const workflow = await this.prisma.workflowDefinition.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!workflow) throw new NotFoundException('Workflow not found');
    return workflow;
  }

  // ── PATCH /workflows/:id ────────────────────────
  async updateWorkflow(id: string, dto: UpdateWorkflowDto) {
    const workflow = await this.prisma.workflowDefinition.findUnique({
      where: { id },
    });
    if (!workflow) throw new NotFoundException('Workflow not found');

    if (dto.name) {
      await this.prisma.workflowDefinition.update({
        where: { id },
        data: { name: dto.name },
      });
    }

    if (dto.stages) {
      // In a real system, updating stages of an active workflow requires complex migration.
      // Here, we simply replace them for simplicity.
      await this.prisma.workflowStage.deleteMany({
        where: { definitionId: id },
      });
      await this.prisma.workflowDefinition.update({
        where: { id },
        data: {
          stages: {
            create: dto.stages.map((stage) => ({
              name: stage.name,
              orderIndex: stage.orderIndex,
              approverRole: stage.approverRole,
            })),
          },
        },
      });
    }

    return this.getWorkflowById(id);
  }

  // ── INTERNAL: Start Workflow Instance ───────────
  async startWorkflowInstance(
    definitionId: string,
    entityType: string,
    entityId: string,
  ) {
    const definition = await this.prisma.workflowDefinition.findUnique({
      where: { id: definitionId },
      include: { stages: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!definition || definition.stages.length === 0) {
      throw new BadRequestException('Invalid workflow definition');
    }

    const initialStageId = definition.stages[0].id;

    return this.prisma.workflowInstance.create({
      data: {
        definitionId,
        currentStageId: initialStageId,
        entityType,
        entityId,
        status: 'IN_PROGRESS',
      },
    });
  }

  // ── POST /workflow-instances/:id/action ─────────
  async executeAction(
    instanceId: string,
    dto: WorkflowActionDto,
    actorId: string,
    hasGlobalPerm: boolean,
  ) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        currentStage: true,
        definition: {
          include: { stages: { orderBy: { orderIndex: 'asc' } } },
        },
      },
    });

    if (!instance) throw new NotFoundException('Workflow instance not found');
    if (instance.status !== 'IN_PROGRESS') {
      throw new BadRequestException(`Workflow is already ${instance.status}`);
    }
    if (!instance.currentStage) {
      throw new BadRequestException('Workflow instance has no current stage');
    }

    // Authorization check
    if (!hasGlobalPerm) {
      // For EVENT entities, we'd need to verify the actor has the specific `approverRole` for the related event.
      // E.g., if entityType == 'REGISTRATION', we check EventOrganizer roles.
      if (instance.entityType === 'REGISTRATION') {
        const registration = await this.prisma.eventRegistration.findUnique({
          where: { id: instance.entityId },
          select: { eventId: true },
        });
        if (!registration)
          throw new NotFoundException('Related registration not found');

        const org = await this.prisma.eventOrganizer.findUnique({
          where: {
            eventId_userId: { eventId: registration.eventId, userId: actorId },
          },
        });

        if (
          !org ||
          (instance.currentStage.approverRole &&
            org.role !== instance.currentStage.approverRole)
        ) {
          throw new ForbiddenException(
            `You do not have the required role: ${instance.currentStage.approverRole}`,
          );
        }
      }
    }

    // Process action
    let nextStageId = instance.currentStageId;
    let newStatus = instance.status;

    if (dto.action === 'APPROVE') {
      const currentIndex = instance.currentStage.orderIndex;
      const nextStage = instance.definition.stages.find(
        (s) => s.orderIndex > currentIndex,
      );

      if (nextStage) {
        nextStageId = nextStage.id;
      } else {
        // Last stage approved
        nextStageId = null;
        newStatus = 'COMPLETED';
        // Auto-approve the underlying registration
        if (instance.entityType === 'REGISTRATION') {
          await this.prisma.eventRegistration.update({
            where: { id: instance.entityId },
            data: { status: 'APPROVED' },
          });
        }
      }
    } else if (dto.action === 'REJECT') {
      nextStageId = null;
      newStatus = 'CANCELLED';
      // Auto-reject the underlying registration
      if (instance.entityType === 'REGISTRATION') {
        await this.prisma.eventRegistration.update({
          where: { id: instance.entityId },
          data: { status: 'REJECTED', rejectionReason: dto.comments },
        });
      }
    } else if (dto.action === 'RETURN') {
      // Find previous stage
      const currentIndex = instance.currentStage.orderIndex;
      // In this implementation, a stage might have orderIndex 0, 1, 2...
      // Finding strictly smaller orderIndex, picking the largest among them.
      const prevStages = instance.definition.stages.filter(
        (s) => s.orderIndex < currentIndex,
      );
      if (prevStages.length > 0) {
        const prevStage = prevStages.reduce((prev, current) =>
          prev.orderIndex > current.orderIndex ? prev : current,
        );
        nextStageId = prevStage.id;
      } else {
        throw new BadRequestException('Cannot RETURN from the first stage');
      }
    } else if (dto.action === 'SKIP') {
      const currentIndex = instance.currentStage.orderIndex;
      const nextStage = instance.definition.stages.find(
        (s) => s.orderIndex > currentIndex,
      );
      if (nextStage) {
        nextStageId = nextStage.id;
      } else {
        nextStageId = null;
        newStatus = 'COMPLETED';
        if (instance.entityType === 'REGISTRATION') {
          await this.prisma.eventRegistration.update({
            where: { id: instance.entityId },
            data: { status: 'APPROVED' },
          });
        }
      }
    }
    // ESCALATE could mean assigning to a specific person, left simple for now.

    // Record action
    await this.prisma.workflowAction.create({
      data: {
        instanceId,
        actorId,
        action: dto.action,
        comments: dto.comments,
      },
    });

    // Update instance
    return this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        currentStageId: nextStageId,
        status: newStatus,
      },
    });
  }

  // ── GET /workflow-instances/:id/history ─────────
  async getWorkflowHistory(
    instanceId: string,
    userId: string,
    hasGlobalPerm: boolean,
  ) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
    });
    if (!instance) throw new NotFoundException('Workflow instance not found');

    // Basic auth check: usually only participants involved or admins
    // (Omitted strict check for brevity, assumed if they can view registration they can view history)

    const actions = await this.prisma.workflowAction.findMany({
      where: { instanceId },
      include: {
        actor: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return actions;
  }
}
