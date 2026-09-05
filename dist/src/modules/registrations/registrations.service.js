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
exports.RegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const workflow_service_1 = require("../workflow/workflow.service");
let RegistrationsService = class RegistrationsService {
    prisma;
    workflowService;
    constructor(prisma, workflowService) {
        this.prisma = prisma;
        this.workflowService = workflowService;
    }
    async register(eventId, userId, dto) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { form: true },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.status !== 'REGISTRATION_OPEN') {
            throw new common_1.BadRequestException('Registration is not open for this event');
        }
        if (event.maxParticipants) {
            const currentRegs = await this.prisma.eventRegistration.count({
                where: { eventId, status: { notIn: ['REJECTED', 'CANCELLED'] } },
            });
            if (currentRegs >= event.maxParticipants) {
                throw new common_1.BadRequestException('Event has reached maximum capacity');
            }
        }
        const existing = await this.prisma.eventRegistration.findUnique({
            where: { eventId_userId: { eventId, userId } },
        });
        if (existing) {
            throw new common_1.ConflictException('You are already registered for this event');
        }
        const submission = await this.prisma.eventFormSubmission.create({
            data: {
                formId: event.form?.id || '',
                userId,
                answers: dto.answers,
            },
        });
        const registration = await this.prisma.eventRegistration.create({
            data: {
                eventId,
                userId,
                submissionId: submission.id,
                status: 'PENDING',
            },
        });
        const defaultWorkflow = await this.prisma.workflowDefinition.findUnique({
            where: { name: 'Event Registration Approval' },
        });
        if (defaultWorkflow) {
            await this.workflowService.startWorkflowInstance(defaultWorkflow.id, 'REGISTRATION', registration.id);
        }
        return registration;
    }
    async getEventRegistrations(eventId, userId, hasGlobalPerm) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (!hasGlobalPerm) {
            const org = await this.prisma.eventOrganizer.findUnique({
                where: { eventId_userId: { eventId, userId } },
            });
            if (!org)
                throw new common_1.ForbiddenException('You are not an organizer for this event');
        }
        return this.prisma.eventRegistration.findMany({
            where: { eventId },
            include: {
                user: { include: { profile: true } },
                submission: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getRegistrationById(id, userId, hasGlobalPerm) {
        const registration = await this.prisma.eventRegistration.findUnique({
            where: { id },
            include: {
                event: true,
                user: { include: { profile: true } },
                submission: true,
            },
        });
        if (!registration)
            throw new common_1.NotFoundException('Registration not found');
        if (!hasGlobalPerm && registration.userId !== userId) {
            const org = await this.prisma.eventOrganizer.findUnique({
                where: { eventId_userId: { eventId: registration.eventId, userId } },
            });
            if (!org)
                throw new common_1.ForbiddenException('You do not have access to this registration');
        }
        return registration;
    }
    async updateStatus(id, dto, actorId, hasGlobalPerm) {
        const registration = await this.prisma.eventRegistration.findUnique({
            where: { id },
        });
        if (!registration)
            throw new common_1.NotFoundException('Registration not found');
        if (!hasGlobalPerm) {
            const org = await this.prisma.eventOrganizer.findUnique({
                where: {
                    eventId_userId: { eventId: registration.eventId, userId: actorId },
                },
            });
            if (!org)
                throw new common_1.ForbiddenException('You are not an organizer for this event');
        }
        if (dto.status === 'REJECTED' && !dto.rejectionReason) {
            throw new common_1.BadRequestException('Rejection reason must be provided');
        }
        return this.prisma.eventRegistration.update({
            where: { id },
            data: {
                status: dto.status,
                rejectionReason: dto.status === 'REJECTED' ? dto.rejectionReason : null,
            },
        });
    }
    async approveAll(eventId, actorId, hasGlobalPerm) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (!hasGlobalPerm) {
            const org = await this.prisma.eventOrganizer.findUnique({
                where: { eventId_userId: { eventId, userId: actorId } },
            });
            if (!org)
                throw new common_1.ForbiddenException('You are not an organizer for this event');
        }
        const result = await this.prisma.eventRegistration.updateMany({
            where: { eventId, status: 'PENDING' },
            data: { status: 'APPROVED' },
        });
        return { message: `${result.count} registrations approved` };
    }
    async getMyRegistrations(userId) {
        return this.prisma.eventRegistration.findMany({
            where: { userId },
            include: {
                event: {
                    select: { id: true, name: true, startDate: true, status: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(id, userId) {
        const registration = await this.prisma.eventRegistration.findUnique({
            where: { id },
        });
        if (!registration)
            throw new common_1.NotFoundException('Registration not found');
        if (registration.userId !== userId)
            throw new common_1.ForbiddenException('You can only delete your own registrations');
        await this.prisma.eventRegistration.delete({
            where: { id },
        });
        return { message: 'Registration deleted successfully' };
    }
    async exportRegistrations(eventId, userId, hasGlobalPerm) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (!hasGlobalPerm) {
            const org = await this.prisma.eventOrganizer.findUnique({
                where: { eventId_userId: { eventId, userId } },
            });
            if (!org)
                throw new common_1.ForbiddenException('You are not an organizer for this event');
        }
        const registrations = await this.prisma.eventRegistration.findMany({
            where: { eventId },
            include: {
                user: { include: { profile: true } },
                submission: true,
            },
        });
        return registrations.map((reg) => ({
            registrationId: reg.id,
            status: reg.status,
            user: {
                id: reg.user.id,
                email: reg.user.email,
                registrationNumber: reg.user.registrationNumber,
                firstName: reg.user.profile?.firstName,
                lastName: reg.user.profile?.lastName,
            },
            answers: reg.submission?.answers,
            createdAt: reg.createdAt,
        }));
    }
};
exports.RegistrationsService = RegistrationsService;
exports.RegistrationsService = RegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_service_1.WorkflowService])
], RegistrationsService);
//# sourceMappingURL=registrations.service.js.map