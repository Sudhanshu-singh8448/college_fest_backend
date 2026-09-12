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
        if (event.status !== 'REGISTRATION_OPEN' && event.status !== 'PUBLISHED') {
            throw new common_1.BadRequestException('Registration is not open for this event');
        }
        if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
            throw new common_1.BadRequestException('Registration deadline for this event has passed');
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
        const leaderUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, registrationNumber: true },
        });
        if (!leaderUser)
            throw new common_1.NotFoundException('User not found');
        const isTeamEvent = (event.maxTeamSize && event.maxTeamSize > 1) ||
            (event.minTeamSize && event.minTeamSize > 1);
        const answers = (dto.answers ?? {});
        const teamName = (answers.team_name ?? answers.teamName)?.toString()?.trim();
        let rawMembers = [];
        if (answers.members) {
            if (Array.isArray(answers.members)) {
                rawMembers = answers.members
                    .map((m) => m?.toString()?.trim() ?? '')
                    .filter(Boolean);
            }
            else if (typeof answers.members === 'string') {
                rawMembers = answers.members
                    .split(/[,;\s]+/)
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
        }
        const teammateRegNumbers = Array.from(new Set(rawMembers.filter((reg) => reg !== leaderUser.registrationNumber)));
        let teammateUsers = [];
        if (isTeamEvent || teamName || teammateRegNumbers.length > 0) {
            if (teammateRegNumbers.length > 0) {
                teammateUsers = await this.prisma.user.findMany({
                    where: { registrationNumber: { in: teammateRegNumbers } },
                    select: { id: true, registrationNumber: true },
                });
                const foundRegs = new Set(teammateUsers.map((u) => u.registrationNumber));
                const missingRegs = teammateRegNumbers.filter((r) => !foundRegs.has(r));
                if (missingRegs.length > 0) {
                    throw new common_1.BadRequestException(`Student(s) with registration number(s) not found: ${missingRegs.join(', ')}. Please verify their 11-digit numbers.`);
                }
                const existingTeammateRegs = await this.prisma.eventRegistration.findMany({
                    where: {
                        eventId,
                        userId: { in: teammateUsers.map((u) => u.id) },
                        status: { notIn: ['REJECTED', 'CANCELLED'] },
                    },
                    include: { user: { select: { registrationNumber: true } } },
                });
                if (existingTeammateRegs.length > 0) {
                    const conflictList = existingTeammateRegs
                        .map((r) => r.user.registrationNumber)
                        .join(', ');
                    throw new common_1.ConflictException(`The following teammate(s) are already registered for this event: ${conflictList}`);
                }
            }
            const totalTeamSize = 1 + teammateUsers.length;
            if (event.minTeamSize && totalTeamSize < event.minTeamSize) {
                throw new common_1.BadRequestException(`This team event requires a minimum of ${event.minTeamSize} members. Current team size is ${totalTeamSize}.`);
            }
            if (event.maxTeamSize && totalTeamSize > event.maxTeamSize) {
                throw new common_1.BadRequestException(`This team event allows a maximum of ${event.maxTeamSize} members. Current team size is ${totalTeamSize}.`);
            }
        }
        let form = event.form;
        if (!form) {
            form = await this.prisma.eventForm.create({
                data: {
                    eventId,
                    schema: [],
                },
            });
        }
        const allTeamRegNumbers = [
            leaderUser.registrationNumber,
            ...teammateUsers.map((u) => u.registrationNumber),
        ];
        const leaderSubmission = await this.prisma.eventFormSubmission.create({
            data: {
                formId: form.id,
                userId,
                answers: {
                    ...answers,
                    team_name: teamName || undefined,
                    team_leader_id: userId,
                    team_leader_reg: leaderUser.registrationNumber,
                    is_team_leader: true,
                    members: allTeamRegNumbers,
                },
            },
        });
        const registration = await this.prisma.eventRegistration.create({
            data: {
                eventId,
                userId,
                submissionId: leaderSubmission.id,
                status: 'APPROVED',
            },
        });
        for (const teammate of teammateUsers) {
            const teammateSubmission = await this.prisma.eventFormSubmission.create({
                data: {
                    formId: form.id,
                    userId: teammate.id,
                    answers: {
                        ...answers,
                        team_name: teamName || undefined,
                        team_leader_id: userId,
                        team_leader_reg: leaderUser.registrationNumber,
                        is_team_leader: false,
                        members: allTeamRegNumbers,
                    },
                },
            });
            await this.prisma.eventRegistration.create({
                data: {
                    eventId,
                    userId: teammate.id,
                    submissionId: teammateSubmission.id,
                    status: 'APPROVED',
                },
            });
        }
        const conv = await this.prisma.conversation.upsert({
            where: { eventId },
            update: {},
            create: {
                type: 'EVENT',
                name: event.name,
                eventId,
            },
        });
        const allParticipantIds = [userId, ...teammateUsers.map((u) => u.id)];
        for (const pId of allParticipantIds) {
            await this.prisma.conversationMember.upsert({
                where: {
                    conversationId_userId: {
                        conversationId: conv.id,
                        userId: pId,
                    },
                },
                update: {},
                create: {
                    conversationId: conv.id,
                    userId: pId,
                    role: 'MEMBER',
                },
            });
        }
        if (teamName && allParticipantIds.length > 1) {
            try {
                const teamConv = await this.prisma.conversation.create({
                    data: {
                        type: 'CUSTOM',
                        name: `Team: ${teamName} (${event.name})`,
                        eventId,
                    },
                });
                for (const pId of allParticipantIds) {
                    await this.prisma.conversationMember.create({
                        data: {
                            conversationId: teamConv.id,
                            userId: pId,
                            role: pId === userId ? 'ADMIN' : 'MEMBER',
                        },
                    });
                }
            }
            catch {
            }
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
        const updated = await this.prisma.eventRegistration.update({
            where: { id },
            data: {
                status: dto.status,
                rejectionReason: dto.status === 'REJECTED' ? dto.rejectionReason : null,
            },
        });
        if (dto.status === 'REJECTED' || dto.status === 'CANCELLED') {
            const conv = await this.prisma.conversation.findUnique({
                where: { eventId: registration.eventId },
            });
            if (conv) {
                const isOrg = await this.prisma.eventOrganizer.findUnique({
                    where: {
                        eventId_userId: {
                            eventId: registration.eventId,
                            userId: registration.userId,
                        },
                    },
                });
                if (!isOrg) {
                    await this.prisma.conversationMember.deleteMany({
                        where: { conversationId: conv.id, userId: registration.userId },
                    });
                }
            }
        }
        return updated;
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
                submission: true,
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
        const conv = await this.prisma.conversation.findUnique({
            where: { eventId: registration.eventId },
        });
        if (conv) {
            await this.prisma.conversationMember.deleteMany({
                where: { conversationId: conv.id, userId },
            });
        }
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