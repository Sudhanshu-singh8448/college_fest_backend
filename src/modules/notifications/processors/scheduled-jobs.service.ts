import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationsService } from '../notifications.service';
import { GamificationService } from '../../gamification/gamification.service';

/**
 * Scheduled background jobs for the notification & system-maintenance pipeline.
 *
 * Jobs:
 *  1. EVENT_REMINDERS     — every 15 min: notify users of events starting within 60 min
 *  2. TOKEN_CLEANUP       — daily 3 AM: delete expired refresh tokens
 *  3. NOTIFICATION_DIGEST — every 6 h: batch-send unread notification summaries
 *  4. ANALYTICS_SNAPSHOT  — daily midnight: aggregate daily stats
 *  5. TEMP_FILE_CLEANUP   — daily 4 AM: delete orphaned uploads > 24 h
 *  6. LEADERBOARD_REFRESH — every 5 min: recalculate XP rankings
 *  7. STREAK_CHECK        — daily 1 AM: check/reset daily login streaks
 */
@Injectable()
export class ScheduledJobsService {
  private readonly logger = new Logger(ScheduledJobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly gamificationService: GamificationService,
  ) {}

  // ─────────────────────────────────────────────────────
  // 1. Event Reminders — every 15 minutes
  // ─────────────────────────────────────────────────────
  @Cron('*/15 * * * *')
  async sendEventReminders() {
    this.logger.debug('[CRON] sendEventReminders');
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Find events starting in the next 15–60 minutes
    const upcomingEvents = await this.prisma.event.findMany({
      where: {
        startDate: { gte: fifteenMinutesAgo, lte: oneHourFromNow },
        status: { in: ['REGISTRATION_CLOSED', 'IN_PROGRESS'] },
        deletedAt: null,
      },
    });

    for (const event of upcomingEvents) {
      // Find all APPROVED registrations for this event
      const registrations = await this.prisma.eventRegistration.findMany({
        where: {
          eventId: event.id,
          status: { in: ['APPROVED', 'CHECKED_IN'] },
        },
        select: { userId: true },
      });

      for (const reg of registrations) {
        await this.notificationsService.send({
          userId: reg.userId,
          type: 'EVENT_REMINDER',
          title: `⏰ Reminder: ${event.name} starts soon!`,
          body: `${event.name} begins at ${event.startDate.toLocaleTimeString()}. Venue: ${event.venue || 'TBA'}`,
          data: { eventId: event.id },
        });
      }
    }
    this.logger.log(
      `[CRON] Sent reminders for ${upcomingEvents.length} events`,
    );
  }

  // ─────────────────────────────────────────────────────
  // 2. Token Cleanup — daily at 3 AM
  // ─────────────────────────────────────────────────────
  @Cron('0 3 * * *')
  async cleanupExpiredTokens() {
    this.logger.debug('[CRON] cleanupExpiredTokens');
    const now = new Date();

    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    this.logger.log(`[CRON] Deleted ${result.count} expired refresh tokens`);
  }

  // ─────────────────────────────────────────────────────
  // 3. Notification Digest — every 6 hours
  // ─────────────────────────────────────────────────────
  @Cron('0 */6 * * *')
  async sendNotificationDigest() {
    this.logger.debug('[CRON] sendNotificationDigest');

    // Find users with unread notifications older than 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const usersWithUnread = await this.prisma.notification.groupBy({
      by: ['userId'],
      where: { isRead: false, createdAt: { lt: sixHoursAgo } },
      _count: { id: true },
    });

    for (const entry of usersWithUnread) {
      const count = entry._count.id;
      if (count < 3) continue; // Don't spam for < 3 notifications

      await this.notificationsService.send({
        userId: entry.userId,
        type: 'ANNOUNCEMENT',
        title: `You have ${count} unread notifications`,
        body: 'Tap to catch up on what you missed in TechGram.',
        data: { digest: true, count },
      });
    }

    this.logger.log(`[CRON] Sent digest to ${usersWithUnread.length} users`);
  }

  // ─────────────────────────────────────────────────────
  // 4. Analytics Snapshot — daily at midnight
  // ─────────────────────────────────────────────────────
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async takeAnalyticsSnapshot() {
    this.logger.debug('[CRON] takeAnalyticsSnapshot');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalRegistrations, totalEvents] = await Promise.all([
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.eventRegistration.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.event.count({ where: { deletedAt: null } }),
    ]);

    // In production: store in a dedicated analytics/stats table or push to ClickHouse
    this.logger.log(
      `[CRON] Daily snapshot — users:${totalUsers} regs_today:${totalRegistrations} events:${totalEvents}`,
    );
  }

  // ─────────────────────────────────────────────────────
  // 5. Temp File Cleanup — daily at 4 AM
  // ─────────────────────────────────────────────────────
  @Cron('0 4 * * *')
  async cleanupOrphanedFiles() {
    this.logger.debug('[CRON] cleanupOrphanedFiles');
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await this.prisma.file.deleteMany({
      where: { status: 'ORPHANED', createdAt: { lt: cutoff } },
    });

    this.logger.log(`[CRON] Deleted ${result.count} orphaned file records`);
  }

  // ─────────────────────────────────────────────────────
  // 6. Leaderboard Refresh — every 5 minutes
  // ─────────────────────────────────────────────────────
  @Cron('*/5 * * * *')
  async refreshLeaderboard() {
    this.logger.debug('[CRON] refreshLeaderboard');
    await this.gamificationService.refreshLeaderboardCache();
  }

  // ─────────────────────────────────────────────────────
  // 7. Streak Check — daily at 1 AM
  // ─────────────────────────────────────────────────────
  @Cron('0 1 * * *')
  async checkStreaks() {
    this.logger.debug('[CRON] checkStreaks');

    // Find users who haven't been seen recently — mark their streak as reset.
    // (loginStreak / lastLoginAt are stored in UserStreak model — simplified here)
    // In a production app with a UserStreak model, we'd update streaks properly.
    // This implementation logs a placeholder until the Gamification phase is complete.
    this.logger.debug(
      '[CRON] checkStreaks — streak logic deferred to Phase 10 (Gamification)',
    );
  }
}
