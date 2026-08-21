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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma.service");
let GroupsService = class GroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMyGroups(userId) {
        const memberships = await this.prisma.groupMember.findMany({
            where: { userId },
            include: {
                group: {
                    include: {
                        _count: { select: { members: true } },
                    },
                },
            },
        });
        return memberships.map((m) => ({
            ...m.group,
            memberCount: m.group._count.members,
            joinedAt: m.joinedAt,
        }));
    }
    async findOne(id, userId) {
        const group = await this.prisma.group.findUnique({
            where: { id },
            include: {
                _count: { select: { members: true } },
            },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        const isMember = await this.prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId: id, userId } },
        });
        if (!isMember) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        return { ...group, memberCount: group._count.members };
    }
    async create(dto, creatorId) {
        const group = await this.prisma.group.create({
            data: {
                name: dto.name,
                type: dto.type,
                autoAssignRule: dto.autoAssignRule || undefined,
                members: {
                    create: {
                        userId: creatorId,
                    },
                },
            },
        });
        return group;
    }
    async update(id, dto, userId) {
        const group = await this.prisma.group.findUnique({ where: { id } });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        await this.assertMembership(id, userId);
        return this.prisma.group.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
            },
        });
    }
    async remove(id) {
        const group = await this.prisma.group.findUnique({ where: { id } });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        await this.prisma.groupMember.deleteMany({ where: { groupId: id } });
        await this.prisma.group.delete({ where: { id } });
        return { message: 'Group deleted successfully' };
    }
    async getMembers(groupId, userId) {
        await this.assertMembership(groupId, userId);
        return this.prisma.groupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    include: { profile: true },
                    select: undefined,
                },
            },
            orderBy: { joinedAt: 'asc' },
        });
    }
    async addMember(groupId, targetUserId, actorId) {
        const group = await this.prisma.group.findUnique({ where: { id: groupId } });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        await this.assertMembership(groupId, actorId);
        const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
        }
        const existing = await this.prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId: targetUserId } },
        });
        if (existing) {
            throw new common_1.ConflictException('User is already a member of this group');
        }
        await this.prisma.groupMember.create({
            data: { groupId, userId: targetUserId },
        });
        return { message: 'Member added successfully' };
    }
    async removeMember(groupId, targetUserId, actorId) {
        const group = await this.prisma.group.findUnique({ where: { id: groupId } });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        await this.assertMembership(groupId, actorId);
        const membership = await this.prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId: targetUserId } },
        });
        if (!membership) {
            throw new common_1.NotFoundException('User is not a member of this group');
        }
        await this.prisma.groupMember.delete({
            where: { groupId_userId: { groupId, userId: targetUserId } },
        });
        return { message: 'Member removed successfully' };
    }
    async autoAssignGroups(userId, registrationNumber) {
        const systemGroups = await this.prisma.group.findMany({
            where: {
                type: 'SYSTEM',
                autoAssignRule: { not: client_1.Prisma.DbNull },
            },
        });
        const formats = await this.prisma.registrationNumberFormat.findMany();
        let parsedData = {};
        for (const format of formats) {
            const regex = new RegExp(format.regex);
            const match = registrationNumber.match(regex);
            if (match) {
                const map = format.formatMap;
                for (const [groupIndex, fieldName] of Object.entries(map)) {
                    const idx = parseInt(groupIndex, 10);
                    if (match[idx]) {
                        parsedData[fieldName] = match[idx];
                    }
                }
                break;
            }
        }
        for (const group of systemGroups) {
            const rule = group.autoAssignRule;
            if (!rule)
                continue;
            const matches = Object.entries(rule).every(([key, value]) => parsedData[key] === String(value));
            if (matches) {
                const existing = await this.prisma.groupMember.findUnique({
                    where: { groupId_userId: { groupId: group.id, userId } },
                });
                if (!existing) {
                    await this.prisma.groupMember.create({
                        data: { groupId: group.id, userId },
                    });
                }
            }
        }
    }
    async assertMembership(groupId, userId) {
        const membership = await this.prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId, userId } },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        return membership;
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map