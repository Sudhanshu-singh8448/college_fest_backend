import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /events ───────────────────────────────
  async findAll(query: EventQueryDto) {
    const { page = 1, limit = 10, search, category, status, festId } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;
    if (festId) where.festId = festId;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          fest: { select: { id: true, name: true, year: true } },
          _count: { select: { registrations: true } },
        },
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

  // ── GET /events/:id ───────────────────────────
  async findOne(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, deletedAt: null },
      include: {
        organizers: {
          include: {
            user: { include: { profile: true } },
          },
        },
        fest: true,
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    // Strip passwordHash
    const safeOrganizers = event.organizers.map((org) => {
      const { passwordHash, ...safeUser } = org.user;
      return { ...org, user: safeUser };
    });

    return { ...event, organizers: safeOrganizers };
  }

  // ── POST /events ──────────────────────────────
  async create(dto: CreateEventDto, creatorId: string) {
    // Ensure fest exists
    const fest = await this.prisma.fest.findUnique({
      where: { id: dto.festId },
    });
    if (!fest) throw new NotFoundException('Fest not found');

    // Create event, assign creator as PRIMARY organizer, create EVENT group
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
          },
        },
        // Auto-create basic form schema
        form: {
          create: {
            schema: [
              {
                name: 'team_name',
                label: 'Team Name',
                type: 'text',
                validation: { required: true },
              },
            ],
          },
        },
      },
    });

    // Create an EVENT group for this event
    await this.prisma.group.create({
      data: {
        name: `Event: ${event.name}`,
        type: 'EVENT',
        members: {
          create: { userId: creatorId },
        },
      },
    });

    return event;
  }

  // ── PATCH /events/:id ─────────────────────────
  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
    hasGlobalPerm: boolean,
  ) {
    await this.assertEventExists(id);
    if (!hasGlobalPerm) await this.assertOrganizer(id, userId);

    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.startDate !== undefined && {
          startDate: new Date(dto.startDate),
        }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.venue !== undefined && { venue: dto.venue }),
        ...(dto.maxParticipants !== undefined && {
          maxParticipants: dto.maxParticipants,
        }),
        ...(dto.minTeamSize !== undefined && { minTeamSize: dto.minTeamSize }),
        ...(dto.maxTeamSize !== undefined && { maxTeamSize: dto.maxTeamSize }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        ...(dto.bannerUrl !== undefined && { bannerUrl: dto.bannerUrl }),
      },
    });
  }

  // ── DELETE /events/:id ────────────────────────
  async remove(id: string) {
    await this.assertEventExists(id);
    return this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });
  }

  // ── PATCH /events/:id/status ──────────────────
  async updateStatus(
    id: string,
    status: string,
    userId: string,
    hasGlobalPerm: boolean,
  ) {
    await this.assertEventExists(id);
    if (!hasGlobalPerm) await this.assertOrganizer(id, userId);

    return this.prisma.event.update({
      where: { id },
      data: { status },
    });
  }

  // ── GET /events/:id/organizers ────────────────
  async getOrganizers(id: string, userId: string, hasGlobalPerm: boolean) {
    await this.assertEventExists(id);
    // Anyone with event:view can see organizers

    const organizers = await this.prisma.eventOrganizer.findMany({
      where: { eventId: id },
      include: {
        user: { include: { profile: true } },
      },
    });

    return organizers.map((org) => {
      const { passwordHash, ...safeUser } = org.user;
      return { ...org, user: safeUser };
    });
  }

  // ── POST /events/:id/organizers ───────────────
  async addOrganizer(
    id: string,
    targetUserId: string,
    role: string,
    actorId: string,
    hasGlobalPerm: boolean,
  ) {
    await this.assertEventExists(id);
    if (!hasGlobalPerm) await this.assertOrganizer(id, actorId, ['PRIMARY']); // Only PRIMARY can add others

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.eventOrganizer.findUnique({
      where: { eventId_userId: { eventId: id, userId: targetUserId } },
    });

    if (existing) throw new ConflictException('User is already an organizer');

    await this.prisma.eventOrganizer.create({
      data: { eventId: id, userId: targetUserId, role },
    });

    return { message: 'Organizer added successfully' };
  }

  // ── DELETE /events/:id/organizers/:userId ─────
  async removeOrganizer(
    id: string,
    targetUserId: string,
    actorId: string,
    hasGlobalPerm: boolean,
  ) {
    await this.assertEventExists(id);
    if (!hasGlobalPerm) await this.assertOrganizer(id, actorId, ['PRIMARY']);

    const existing = await this.prisma.eventOrganizer.findUnique({
      where: { eventId_userId: { eventId: id, userId: targetUserId } },
    });

    if (!existing) throw new NotFoundException('Organizer not found');

    if (existing.role === 'PRIMARY') {
      const primaryCount = await this.prisma.eventOrganizer.count({
        where: { eventId: id, role: 'PRIMARY' },
      });
      if (primaryCount <= 1) {
        throw new ConflictException('Cannot remove the last PRIMARY organizer');
      }
    }

    await this.prisma.eventOrganizer.delete({
      where: { eventId_userId: { eventId: id, userId: targetUserId } },
    });

    return { message: 'Organizer removed successfully' };
  }

  // ── GET /events/:id/stats ─────────────────────
  async getStats(id: string, userId: string, hasGlobalPerm: boolean) {
    await this.assertEventExists(id);
    if (!hasGlobalPerm) await this.assertOrganizer(id, userId);

    const [totalRegs, statusCounts, attendanceCount] = await Promise.all([
      this.prisma.eventRegistration.count({ where: { eventId: id } }),
      this.prisma.eventRegistration.groupBy({
        by: ['status'],
        where: { eventId: id },
        _count: true,
      }),
      this.prisma.attendance.count({ where: { eventId: id } }),
    ]);

    return {
      totalRegistrations: totalRegs,
      statusBreakdown: statusCounts.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      checkedIn: attendanceCount,
    };
  }

  // ── Helpers ───────────────────────────────────
  private async assertEventExists(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, deletedAt: null },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  private async assertOrganizer(
    eventId: string,
    userId: string,
    allowedRoles?: string[],
  ) {
    const org = await this.prisma.eventOrganizer.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (!org) {
      throw new ForbiddenException('You are not an organizer of this event');
    }

    if (allowedRoles && !allowedRoles.includes(org.role)) {
      throw new ForbiddenException(
        `Requires one of roles: ${allowedRoles.join(', ')}`,
      );
    }

    return org;
  }
}
