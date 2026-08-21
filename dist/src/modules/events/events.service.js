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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, category, status, festId } = query;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category)
            where.category = category;
        if (status)
            where.status = status;
        if (festId)
            where.festId = festId;
        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startDate: 'asc' },
                include: {
                    fest: { select: { id: true, name: true, year: true } },
                    _count: { select: { registrations: true } },
                }
            }),
            this.prisma.event.count({ where }),
        ]);
        return {
            items: events,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const event = await this.prisma.event.findFirst({
            where: { id, deletedAt: null },
            include: {
                organizers: {
                    include: {
                        user: { include: { profile: true } }
                    }
                },
                fest: true,
            },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const safeOrganizers = event.organizers.map(org => {
            const { passwordHash, ...safeUser } = org.user;
            return { ...org, user: safeUser };
        });
        return { ...event, organizers: safeOrganizers };
    }
    async create(dto, creatorId) {
        const fest = await this.prisma.fest.findUnique({ where: { id: dto.festId } });
        if (!fest)
            throw new common_1.NotFoundException('Fest not found');
        const event = await this.prisma.event.create({
            data: {
                festId: dto.festId,
                name: dto.name,
                description: dto.description,
                category: dto.category,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                venue: dto.venue,
                maxParticipants: dto.maxParticipants,
                minTeamSize: dto.minTeamSize,
                maxTeamSize: dto.maxTeamSize,
                isPublic: dto.isPublic ?? true,
                bannerUrl: dto.bannerUrl,
                organizers: {
                    create: {
                        userId: creatorId,
                        role: 'PRIMARY',
                    }
                },
                form: {
                    create: {
                        schema: [
                            { name: 'team_name', label: 'Team Name', type: 'text', validation: { required: true } }
                        ]
                    }
                }
            }
        });
        await this.prisma.group.create({
            data: {
                name: `Event: ${event.name}`,
                type: 'EVENT',
                members: {
                    create: { userId: creatorId }
                }
            }
        });
        return event;
    }
    async update(id, dto, userId, hasGlobalPerm) {
        await this.assertEventExists(id);
        if (!hasGlobalPerm)
            await this.assertOrganizer(id, userId);
        return this.prisma.event.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.category !== undefined && { category: dto.category }),
                ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
                ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
                ...(dto.venue !== undefined && { venue: dto.venue }),
                ...(dto.maxParticipants !== undefined && { maxParticipants: dto.maxParticipants }),
                ...(dto.minTeamSize !== undefined && { minTeamSize: dto.minTeamSize }),
                ...(dto.maxTeamSize !== undefined && { maxTeamSize: dto.maxTeamSize }),
                ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
                ...(dto.bannerUrl !== undefined && { bannerUrl: dto.bannerUrl }),
            }
        });
    }
    async remove(id) {
        await this.assertEventExists(id);
        return this.prisma.event.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'ARCHIVED' },
        });
    }
    async updateStatus(id, status, userId, hasGlobalPerm) {
        await this.assertEventExists(id);
        if (!hasGlobalPerm)
            await this.assertOrganizer(id, userId);
        return this.prisma.event.update({
            where: { id },
            data: { status },
        });
    }
    async getOrganizers(id, userId, hasGlobalPerm) {
        await this.assertEventExists(id);
        const organizers = await this.prisma.eventOrganizer.findMany({
            where: { eventId: id },
            include: {
                user: { include: { profile: true } }
            }
        });
        return organizers.map(org => {
            const { passwordHash, ...safeUser } = org.user;
            return { ...org, user: safeUser };
        });
    }
    async addOrganizer(id, targetUserId, role, actorId, hasGlobalPerm) {
        await this.assertEventExists(id);
        if (!hasGlobalPerm)
            await this.assertOrganizer(id, actorId, ['PRIMARY']);
        const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const existing = await this.prisma.eventOrganizer.findUnique({
            where: { eventId_userId: { eventId: id, userId: targetUserId } }
        });
        if (existing)
            throw new common_1.ConflictException('User is already an organizer');
        await this.prisma.eventOrganizer.create({
            data: { eventId: id, userId: targetUserId, role }
        });
        return { message: 'Organizer added successfully' };
    }
    async removeOrganizer(id, targetUserId, actorId, hasGlobalPerm) {
        await this.assertEventExists(id);
        if (!hasGlobalPerm)
            await this.assertOrganizer(id, actorId, ['PRIMARY']);
        const existing = await this.prisma.eventOrganizer.findUnique({
            where: { eventId_userId: { eventId: id, userId: targetUserId } }
        });
        if (!existing)
            throw new common_1.NotFoundException('Organizer not found');
        if (existing.role === 'PRIMARY') {
            const primaryCount = await this.prisma.eventOrganizer.count({
                where: { eventId: id, role: 'PRIMARY' }
            });
            if (primaryCount <= 1) {
                throw new common_1.ConflictException('Cannot remove the last PRIMARY organizer');
            }
        }
        await this.prisma.eventOrganizer.delete({
            where: { eventId_userId: { eventId: id, userId: targetUserId } }
        });
        return { message: 'Organizer removed successfully' };
    }
    async getStats(id, userId, hasGlobalPerm) {
        await this.assertEventExists(id);
        if (!hasGlobalPerm)
            await this.assertOrganizer(id, userId);
        const [totalRegs, statusCounts, attendanceCount] = await Promise.all([
            this.prisma.eventRegistration.count({ where: { eventId: id } }),
            this.prisma.eventRegistration.groupBy({
                by: ['status'],
                where: { eventId: id },
                _count: true
            }),
            this.prisma.attendance.count({ where: { eventId: id } }),
        ]);
        return {
            totalRegistrations: totalRegs,
            statusBreakdown: statusCounts.map(s => ({ status: s.status, count: s._count })),
            checkedIn: attendanceCount,
        };
    }
    async assertEventExists(id) {
        const event = await this.prisma.event.findFirst({ where: { id, deletedAt: null } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        return event;
    }
    async assertOrganizer(eventId, userId, allowedRoles) {
        const org = await this.prisma.eventOrganizer.findUnique({
            where: { eventId_userId: { eventId, userId } }
        });
        if (!org) {
            throw new common_1.ForbiddenException('You are not an organizer of this event');
        }
        if (allowedRoles && !allowedRoles.includes(org.role)) {
            throw new common_1.ForbiddenException(`Requires one of roles: ${allowedRoles.join(', ')}`);
        }
        return org;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map