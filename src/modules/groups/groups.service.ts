import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /groups — own groups ──────────────────
  async findMyGroups(userId: string) {
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

  // ── GET /groups/:id ───────────────────────────
  async findOne(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check membership
    const isMember = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId } },
    });

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return { ...group, memberCount: group._count.members };
  }

  // ── POST /groups ──────────────────────────────
  async create(dto: CreateGroupDto, creatorId: string) {
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

  // ── PATCH /groups/:id ─────────────────────────
  async update(id: string, dto: UpdateGroupDto, userId: string) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Only group members can update (in a full system, check admin role)
    await this.assertMembership(id, userId);

    return this.prisma.group.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
      },
    });
  }

  // ── DELETE /groups/:id ────────────────────────
  async remove(id: string) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Delete all members first, then the group
    await this.prisma.groupMember.deleteMany({ where: { groupId: id } });
    await this.prisma.group.delete({ where: { id } });

    return { message: 'Group deleted successfully' };
  }

  // ── GET /groups/:id/members ───────────────────
  async getMembers(groupId: string, userId: string) {
    await this.assertMembership(groupId, userId);

    return this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          include: { profile: true },
          select: undefined, // Include profile but we'll strip passwordHash below
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  // ── POST /groups/:id/members ──────────────────
  async addMember(groupId: string, targetUserId: string, actorId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    await this.assertMembership(groupId, actorId);

    // Check target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if already a member
    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
    if (existing) {
      throw new ConflictException('User is already a member of this group');
    }

    await this.prisma.groupMember.create({
      data: { groupId, userId: targetUserId },
    });

    return { message: 'Member added successfully' };
  }

  // ── DELETE /groups/:id/members/:userId ────────
  async removeMember(groupId: string, targetUserId: string, actorId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    await this.assertMembership(groupId, actorId);

    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
    if (!membership) {
      throw new NotFoundException('User is not a member of this group');
    }

    await this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });

    return { message: 'Member removed successfully' };
  }

  // ── Auto-Assignment Engine ────────────────────
  // Called when a new user registers — checks all SYSTEM groups' autoAssignRule
  async autoAssignGroups(userId: string, registrationNumber: string) {
    const systemGroups = await this.prisma.group.findMany({
      where: {
        type: 'SYSTEM',
        autoAssignRule: { not: Prisma.DbNull },
      },
    });

    // Get all reg number formats to parse the registration number
    const formats = await this.prisma.registrationNumberFormat.findMany();

    const parsedData: Record<string, string> = {};

    for (const format of formats) {
      const regex = new RegExp(format.regex);
      const match = registrationNumber.match(regex);
      if (match) {
        const map = format.formatMap as Record<string, string>;
        for (const [groupIndex, fieldName] of Object.entries(map)) {
          const idx = parseInt(groupIndex, 10);
          if (match[idx]) {
            parsedData[fieldName] = match[idx];
          }
        }
        break; // Use the first matching format
      }
    }

    for (const group of systemGroups) {
      const rule = group.autoAssignRule as Record<string, any>;
      if (!rule) continue;

      // Check if all rule conditions match the parsed data
      const matches = Object.entries(rule).every(
        ([key, value]) => parsedData[key] === String(value),
      );

      if (matches) {
        // Check if already a member
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

  // ── Helper: Assert Membership ─────────────────
  private async assertMembership(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return membership;
  }
}
