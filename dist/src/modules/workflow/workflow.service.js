"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let WorkflowService = class WorkflowService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWorkflows() {
        return this.prisma.workflowDefinition.findMany({
            include: {
                stages: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
    }
    async createWorkflow(dto) {
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
    async getWorkflowById(id) {
        const workflow = await this.prisma.workflowDefinition.findUnique({
            where: { id },
            include: {
                stages: {
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });
        if (!workflow)
            throw new common_1.NotFoundException('Workflow not found');
        return workflow;
    }
    async updateWorkflow(id, dto) {
        const workflow = await this.prisma.workflowDefinition.findUnique({ where: { id } });
        if (!workflow)
            throw new common_1.NotFoundException('Workflow not found');
        if (dto.name) {
            await this.prisma.workflowDefinition.update({
                where: { id },
                data: { name: dto.name },
            });
        }
        if (dto.stages) {
            await this.prisma.workflowStage.deleteMany({ where: { definitionId: id } });
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
    async startWorkflowInstance(definitionId, entityType, entityId) {
        const definition = await this.prisma.workflowDefinition.findUnique({
            where: { id: definitionId },
            include: { stages: { orderBy: { orderIndex: 'asc' } } },
        });
        if (!definition || definition.stages.length === 0) {
            throw new common_1.BadRequestException('Invalid workflow definition');
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
    async executeAction(instanceId, dto, actorId, hasGlobalPerm) {
        const instance = await this.prisma.workflowInstance.findUnique({
            where: { id: instanceId },
            include: {
                currentStage: true,
                definition: {
                    include: { stages: { orderBy: { orderIndex: 'asc' } } },
                },
            },
        });
        if (!instance)
            throw new common_1.NotFoundException('Workflow instance not found');
        if (instance.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException(`Workflow is already ${instance.status}`);
        }
        if (!instance.currentStage) {
            throw new common_1.BadRequestException('Workflow instance has no current stage');
        }
        if (!hasGlobalPerm) {
            if (instance.entityType === 'REGISTRATION') {
                const registration = await this.prisma.eventRegistration.findUnique({
                    where: { id: instance.entityId },
                    select: { eventId: true },
                });
                if (!registration)
                    throw new common_1.NotFoundException('Related registration not found');
                const org = await this.prisma.eventOrganizer.findUnique({
                    where: { eventId_userId: { eventId: registration.eventId, userId: actorId } },
                });
                if (!org || (instance.currentStage.approverRole && org.role !== instance.currentStage.approverRole)) {
                    throw new common_1.ForbiddenException(`You do not have the required role: ${instance.currentStage.approverRole}`);
                }
            }
        }
        let nextStageId = instance.currentStageId;
        let newStatus = instance.status;
        if (dto.action === 'APPROVE') {
            const currentIndex = instance.currentStage.orderIndex;
            const nextStage = instance.definition.stages.find(s => s.orderIndex > currentIndex);
            if (nextStage) {
                nextStageId = nextStage.id;
            }
            else {
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
        else if (dto.action === 'REJECT') {
            nextStageId = null;
            newStatus = 'CANCELLED';
            if (instance.entityType === 'REGISTRATION') {
                await this.prisma.eventRegistration.update({
                    where: { id: instance.entityId },
                    data: { status: 'REJECTED', rejectionReason: dto.comments },
                });
            }
        }
        else if (dto.action === 'RETURN') {
            const currentIndex = instance.currentStage.orderIndex;
            const prevStages = instance.definition.stages.filter(s => s.orderIndex < currentIndex);
            if (prevStages.length > 0) {
                const prevStage = prevStages.reduce((prev, current) => (prev.orderIndex > current.orderIndex) ? prev : current);
                nextStageId = prevStage.id;
            }
            else {
                throw new common_1.BadRequestException('Cannot RETURN from the first stage');
            }
        }
        else if (dto.action === 'SKIP') {
            const currentIndex = instance.currentStage.orderIndex;
            const nextStage = instance.definition.stages.find(s => s.orderIndex > currentIndex);
            if (nextStage) {
                nextStageId = nextStage.id;
            }
            else {
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
        await this.prisma.workflowAction.create({
            data: {
                instanceId,
                actorId,
                action: dto.action,
                comments: dto.comments,
            },
        });
        return this.prisma.workflowInstance.update({
            where: { id: instanceId },
            data: {
                currentStageId: nextStageId,
                status: newStatus,
            },
        });
    }
    async getWorkflowHistory(instanceId, userId, hasGlobalPerm) {
        const instance = await this.prisma.workflowInstance.findUnique({
            where: { id: instanceId },
        });
        if (!instance)
            throw new common_1.NotFoundException('Workflow instance not found');
        const actions = await this.prisma.workflowAction.findMany({
            where: { instanceId },
            include: {
                actor: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
            },
            orderBy: { createdAt: 'asc' },
        });
        return actions;
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map