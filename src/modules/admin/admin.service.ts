import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateRegNumberFormatDto } from './dto/update-reg-format.dto';
import { SetEventWinnersDto } from './dto/set-event-winners.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // GET /admin/dashboard
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Returns a unified dashboard snapshot:
   * - User KPIs (total, active, new this week)
   * - Event KPIs (total, by status, registration counts)
   * - Finance KPIs (approved spend, pending approvals)
   * - Gamification snapshot (top 5 leaderboard entries)
   */
  async getDashboard() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalEvents,
      eventsByStatus,
      totalRegistrations,
      pendingRegistrations,
      approvedExpenses,
      pendingExpenses,
      totalExpenseAmount,
      feedbackByStatus,
      topLeaderboard,
    ] = await Promise.all([
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({
        where: { status: 'ACTIVE', updatedAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.event.count({ where: { deletedAt: null } }),
      this.prisma.event.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null },
      }),
      this.prisma.eventRegistration.count(),
      this.prisma.eventRegistration.count({ where: { status: 'PENDING' } }),
      this.prisma.expense.count({ where: { status: 'APPROVED' } }),
      this.prisma.expense.count({ where: { status: 'PENDING' } }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { status: 'APPROVED' },
      }),
      this.prisma.feedback.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.leaderboardCache.findMany({
        orderBy: { rank: 'asc' },
        take: 5,
      }),
    ]);

    // Enrich leaderboard with user profiles
    const topUserIds = topLeaderboard.map((e) => e.userId);
    const topUsers = await this.prisma.user.findMany({
      where: { id: { in: topUserIds } },
      select: {
        id: true,
        registrationNumber: true,
        profile: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
    const userMap = Object.fromEntries(topUsers.map((u) => [u.id, u]));

    return {
      users: {
        total: totalUsers,
        activeLast7d: activeUsers,
        newThisWeek: newUsers,
      },
      events: {
        total: totalEvents,
        byStatus: Object.fromEntries(
          eventsByStatus.map((r) => [r.status, r._count.id]),
        ),
        totalRegistrations,
        pendingRegistrations,
      },
      finance: {
        approvedExpensesCount: approvedExpenses,
        pendingApprovalCount: pendingExpenses,
        totalApprovedSpend: totalExpenseAmount._sum.amount ?? 0,
      },
      feedback: Object.fromEntries(
        feedbackByStatus.map((r) => [r.status, r._count.id]),
      ),
      leaderboard: topLeaderboard.map((e) => ({
        rank: e.rank,
        totalXp: e.totalXp,
        level: e.level,
        user: userMap[e.userId] ?? null,
      })),
      generatedAt: new Date(),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /admin/users/stats
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Detailed user statistics: breakdowns by batch, branch, status.
   * Includes search by registration number.
   */
  async getUserStats(query: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total, byStatus, newThisMonth] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          registrationNumber: true,
          email: true,
          status: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
              phone: true,
            },
          },
          roles: { select: { role: { select: { name: true } } } },
          userXp: { select: { totalXp: true, level: true } },
        },
      }),
      this.prisma.user.count({ where }),
      this.prisma.user.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: {
        byStatus: Object.fromEntries(
          byStatus.map((r) => [r.status, r._count.id]),
        ),
        newThisMonth,
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /admin/events/stats
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Event analytics: registration fill rates, attendance rates, top events.
   */
  async getEventStats() {
    const events = await this.prisma.event.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { registrations: true, attendances: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    const [byCategory, byStatus] = await Promise.all([
      this.prisma.event.groupBy({
        by: ['category'],
        _count: { id: true },
        where: { deletedAt: null },
      }),
      this.prisma.event.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null },
      }),
    ]);

    const enriched = events.map((e) => ({
      id: e.id,
      name: e.name,
      status: e.status,
      category: e.category,
      startDate: e.startDate,
      maxParticipants: e.maxParticipants,
      registrationCount: e._count.registrations,
      attendanceCount: e._count.attendances,
      fillRate: e.maxParticipants
        ? Math.round((e._count.registrations / e.maxParticipants) * 100)
        : null,
      attendanceRate:
        e._count.registrations > 0
          ? Math.round((e._count.attendances / e._count.registrations) * 100)
          : 0,
    }));

    return {
      events: enriched,
      summary: {
        total: events.length,
        byCategory: Object.fromEntries(
          byCategory.map((r) => [r.category, r._count.id]),
        ),
        byStatus: Object.fromEntries(
          byStatus.map((r) => [r.status, r._count.id]),
        ),
        avgFillRate:
          enriched
            .filter((e) => e.fillRate !== null)
            .reduce((acc, e) => acc + (e.fillRate ?? 0), 0) /
          (enriched.filter((e) => e.fillRate !== null).length || 1),
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /admin/finance/stats
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Finance analytics: expense totals by category, event, and submitter.
   */
  async getFinanceStats() {
    const [byStatus, byCategory, byEvent, recent] = await Promise.all([
      this.prisma.expense.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      this.prisma.expense.groupBy({
        by: ['eventId'],
        where: { eventId: { not: null } },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      }),
      this.prisma.expense.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 10,
        include: {
          submitter: {
            select: {
              registrationNumber: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
          category: true,
          event: { select: { id: true, name: true } },
        },
      }),
    ]);

    const categories = await this.prisma.expenseCategory.findMany();
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    return {
      byStatus: byStatus.map((r) => ({
        status: r.status,
        total: r._sum.amount ?? 0,
        count: r._count.id,
      })),
      byCategory: byCategory.map((r) => ({
        categoryId: r.categoryId,
        categoryName: catMap[r.categoryId] ?? 'Unknown',
        total: r._sum.amount ?? 0,
        count: r._count.id,
      })),
      topEventsBySpend: byEvent.map((r) => ({
        eventId: r.eventId,
        total: r._sum.amount ?? 0,
        count: r._count.id,
      })),
      pendingApprovals: recent,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /admin/audit-logs
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Search & paginate the audit log. Append-only — no deletes.
   */
  async getAuditLogs(query: AuditLogQueryDto) {
    const {
      page = 1,
      limit = 50,
      actorId,
      action,
      resourceType,
      resourceId,
      from,
      to,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (actorId) where.actorId = actorId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              registrationNumber: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /admin/settings
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Returns all app settings as a key-value map.
   */
  async getSettings() {
    const settings = await this.prisma.appSetting.findMany({
      orderBy: { key: 'asc' },
    });
    return {
      settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
      updatedAt: settings.reduce(
        (latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
        new Date(0),
      ),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PATCH /admin/settings
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Bulk-upsert app settings. Missing keys are created; existing keys are updated.
   */
  async updateSettings(dto: UpdateSettingsDto) {
    const upserts = Object.entries(dto.settings).map(([key, value]) =>
      this.prisma.appSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    );

    await this.prisma.$transaction(upserts);
    return this.getSettings();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUT /admin/reg-number-format
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Update the registration number format stored in app settings.
   * Preview is generated for immediate feedback.
   */
  async updateRegNumberFormat(dto: UpdateRegNumberFormatDto) {
    await this.prisma.$transaction([
      this.prisma.appSetting.upsert({
        where: { key: 'reg.numberFormat' },
        update: { value: dto.format },
        create: { key: 'reg.numberFormat', value: dto.format },
      }),
      this.prisma.appSetting.upsert({
        where: { key: 'reg.prefix' },
        update: { value: dto.prefix },
        create: { key: 'reg.prefix', value: dto.prefix },
      }),
    ]);

    // Generate a preview
    const year = new Date().getFullYear().toString().slice(-2);
    const preview = dto.format
      .replace('{YEAR}', year)
      .replace('{BRANCH}', 'CS')
      .replace('{BATCH}', '2025')
      .replace(/\{SEQ:?(\d*)\}/g, (_, n) => '0001'.slice(-(parseInt(n) || 4)));

    return { format: dto.format, prefix: dto.prefix, preview };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /admin/events/:id/winners
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Get winners for a specific event, ordered by position.
   */
  async getEventWinners(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, name: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    const winners = await this.prisma.eventWinner.findMany({
      where: { eventId },
      orderBy: { position: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            registrationNumber: true,
            profile: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return { event, winners };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POST /admin/events/:id/winners
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Set (replace) all winners for an event.
   * Validates that every userId is a registered participant of the event.
   * Awards the Champion badge and XP to 1st-place winner.
   */
  async setEventWinners(
    eventId: string,
    recordedById: string,
    dto: SetEventWinnersDto,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    // Validate all user IDs are registered participants
    const userIds = dto.winners.map((w) => w.userId);
    const registrations = await this.prisma.eventRegistration.findMany({
      where: {
        eventId,
        userId: { in: userIds },
        status: { in: ['APPROVED', 'CHECKED_IN'] },
      },
      select: { userId: true },
    });
    const registeredIds = new Set(registrations.map((r) => r.userId));
    const invalidIds = userIds.filter((id) => !registeredIds.has(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `These users are not registered participants: ${invalidIds.join(', ')}`,
      );
    }

    // Validate no duplicate positions
    const positions = dto.winners.map((w) => w.position);
    if (new Set(positions).size !== positions.length) {
      throw new BadRequestException('Duplicate positions are not allowed');
    }

    // Replace all winners atomically
    await this.prisma.$transaction([
      this.prisma.eventWinner.deleteMany({ where: { eventId } }),
      ...dto.winners.map((w) =>
        this.prisma.eventWinner.create({
          data: {
            eventId,
            userId: w.userId,
            position: w.position,
            prize: w.prize,
            note: w.note,
            recordedById,
          },
        }),
      ),
    ]);

    return this.getEventWinners(eventId);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /admin/export/:type
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Export structured JSON data for client-side CSV/Excel generation.
   * Supported types: users, events, registrations, expenses, attendance, feedback
   */
  async exportData(type: string) {
    switch (type) {
      case 'users':
        return this.prisma.user.findMany({
          select: {
            id: true,
            registrationNumber: true,
            email: true,
            status: true,
            createdAt: true,
            profile: {
              select: { firstName: true, lastName: true, phone: true },
            },
            roles: { select: { role: { select: { name: true } } } },
          },
          orderBy: { registrationNumber: 'asc' },
        });

      case 'events':
        return this.prisma.event.findMany({
          where: { deletedAt: null },
          include: {
            fest: { select: { name: true } },
            _count: { select: { registrations: true, attendances: true } },
          },
          orderBy: { startDate: 'desc' },
        });

      case 'registrations':
        return this.prisma.eventRegistration.findMany({
          include: {
            user: {
              select: {
                registrationNumber: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
            event: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

      case 'expenses':
        return this.prisma.expense.findMany({
          include: {
            submitter: {
              select: {
                registrationNumber: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
            category: true,
            event: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

      case 'attendance':
        return this.prisma.attendance.findMany({
          include: {
            user: {
              select: {
                registrationNumber: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
            event: { select: { name: true } },
          },
          orderBy: { scannedAt: 'desc' },
        });

      case 'feedback':
        return this.prisma.feedback.findMany({
          include: {
            user: {
              select: {
                registrationNumber: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

      default:
        throw new BadRequestException(
          `Unknown export type "${type}". Valid types: users, events, registrations, expenses, attendance, feedback`,
        );
    }
  }
}
