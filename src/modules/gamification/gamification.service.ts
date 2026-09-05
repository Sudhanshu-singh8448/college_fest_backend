import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  XP_REWARDS,
  calculateLevel,
  DEFAULT_FREEZE_COUNT,
} from './gamification.constants';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────
  // GET /gamification/me
  // ─────────────────────────────────────────────────────
  /**
   * Returns the full gamification profile for the current user:
   * XP total, level, level name, progress to next level,
   * earned badges, and streak data.
   */
  async getMyProfile(userId: string) {
    const [xpRecord, badges, streak, user] = await Promise.all([
      this.prisma.userXp.findUnique({ where: { userId } }),
      this.prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      }),
      this.prisma.userStreak.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          registrationNumber: true,
          profile: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
        },
      }),
    ]);

    const totalXp = xpRecord?.totalXp ?? 0;
    const levelInfo = calculateLevel(totalXp);
    const xpForCurrentLevel =
      ([
        100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 12000, 22000, 36000,
        50000,
      ].find((_, i, arr) => totalXp < (arr[i] ?? Infinity)) ?? 0) -
      (levelInfo.nextLevelXp ? levelInfo.nextLevelXp - 1 : 0);

    // Rank from leaderboard cache
    const leaderboardEntry = await this.prisma.leaderboardCache.findUnique({
      where: { userId },
    });

    return {
      user,
      xp: {
        total: totalXp,
        level: levelInfo.level,
        levelName: levelInfo.name,
        nextLevelXp: levelInfo.nextLevelXp,
        rank: leaderboardEntry?.rank ?? null,
      },
      badges: badges.map((b) => ({
        id: b.id,
        earnedAt: b.earnedAt,
        badge: b.badge,
      })),
      streak: streak
        ? {
            current: streak.currentStreak,
            longest: streak.longestStreak,
            freezesRemaining: streak.freezes,
            lastCheckIn: streak.lastCheckIn,
          }
        : {
            current: 0,
            longest: 0,
            freezesRemaining: DEFAULT_FREEZE_COUNT,
            lastCheckIn: null,
          },
    };
  }

  // ─────────────────────────────────────────────────────
  // GET /gamification/leaderboard
  // ─────────────────────────────────────────────────────
  /**
   * Returns the top-N leaderboard from the materialized LeaderboardCache.
   * Cache is refreshed every 5 minutes by the scheduled job.
   */
  async getLeaderboard(query: LeaderboardQueryDto) {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.leaderboardCache.findMany({
        orderBy: { rank: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.leaderboardCache.count(),
    ]);

    // Enrich with user profile data
    const userIds = entries.map((e) => e.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        registrationNumber: true,
        profile: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    return {
      entries: entries.map((e) => ({
        rank: e.rank,
        totalXp: e.totalXp,
        level: e.level,
        levelName: calculateLevel(e.totalXp).name,
        user: userMap[e.userId] ?? null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      refreshedAt: entries[0]?.updatedAt ?? null,
    };
  }

  // ─────────────────────────────────────────────────────
  // GET /gamification/leaderboard/my-rank
  // ─────────────────────────────────────────────────────
  /**
   * Returns the current user's rank, XP, and surrounding context on the leaderboard.
   */
  async getMyRank(userId: string) {
    const entry = await this.prisma.leaderboardCache.findUnique({
      where: { userId },
    });
    if (!entry) {
      return {
        rank: null,
        totalXp: 0,
        level: 1,
        message: 'Not yet on the leaderboard — earn some XP first!',
      };
    }

    // Fetch users just above and below for context
    const [above, below] = await Promise.all([
      this.prisma.leaderboardCache.findFirst({
        where: { rank: { lt: entry.rank } },
        orderBy: { rank: 'desc' },
      }),
      this.prisma.leaderboardCache.findFirst({
        where: { rank: { gt: entry.rank } },
        orderBy: { rank: 'asc' },
      }),
    ]);

    return {
      rank: entry.rank,
      totalXp: entry.totalXp,
      level: entry.level,
      levelName: calculateLevel(entry.totalXp).name,
      xpToNextRank: above ? above.totalXp - entry.totalXp + 1 : null,
      nearbyRanks: { above, below },
    };
  }

  // ─────────────────────────────────────────────────────
  // GET /gamification/badges
  // ─────────────────────────────────────────────────────
  /**
   * Returns all badge definitions (the "badge catalogue").
   */
  async getAllBadges() {
    return this.prisma.badgeDefinition.findMany({
      orderBy: { xpReward: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────
  // GET /gamification/badges/my
  // ─────────────────────────────────────────────────────
  /**
   * Returns badges earned by the current user, enriched with badge definition data.
   */
  async getMyBadges(userId: string) {
    const badges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    // Get total count for a motivational message
    const totalAvailable = await this.prisma.badgeDefinition.count();

    return {
      earned: badges.map((b) => ({ ...b.badge, earnedAt: b.earnedAt })),
      total: badges.length,
      totalAvailable,
      completionPercent: Math.round((badges.length / totalAvailable) * 100),
    };
  }

  // ─────────────────────────────────────────────────────
  // POST /gamification/streak/check-in
  // ─────────────────────────────────────────────────────
  /**
   * Daily login check-in. Awards XP and updates streak.
   * Idempotent within the same calendar day (UTC).
   */
  async checkIn(userId: string) {
    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const yesterdayUTC = new Date(todayUTC.getTime() - 86_400_000);

    // Get or create streak record
    let streak = await this.prisma.userStreak.findUnique({ where: { userId } });
    if (!streak) {
      streak = await this.prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          freezes: DEFAULT_FREEZE_COUNT,
        },
      });
    }

    // Idempotency: if last check-in was today, return current state
    if (streak.lastCheckIn && streak.lastCheckIn >= todayUTC) {
      return {
        alreadyCheckedIn: true,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        message: 'Already checked in today! Come back tomorrow.',
      };
    }

    // Calculate new streak value
    const isConsecutive =
      streak.lastCheckIn && streak.lastCheckIn >= yesterdayUTC;
    const newStreak = isConsecutive ? streak.currentStreak + 1 : 1;
    const newLongest = Math.max(newStreak, streak.longestStreak);

    // Award daily login XP
    let xpAwarded = XP_REWARDS.DAILY_LOGIN;
    const bonusMessages: string[] = [];

    // Streak milestone bonuses
    if (newStreak === 7) {
      xpAwarded += XP_REWARDS.STREAK_7_DAYS;
      bonusMessages.push(
        `🔥 7-day streak bonus! +${XP_REWARDS.STREAK_7_DAYS} XP`,
      );
      await this.awardBadgeIfNotEarned(userId, 'Digital Native');
    }
    if (newStreak === 30) {
      xpAwarded += XP_REWARDS.STREAK_30_DAYS;
      bonusMessages.push(
        `🏆 30-day streak bonus! +${XP_REWARDS.STREAK_30_DAYS} XP`,
      );
    }

    // Night owl badge (check-in between 00:00 and 04:00 local)
    if (now.getHours() < 4) {
      await this.awardBadgeIfNotEarned(userId, 'Night Owl');
    }

    // Update streak record
    const updatedStreak = await this.prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastCheckIn: now,
      },
    });

    // Award XP
    const newXpRecord = await this.awardXp(userId, xpAwarded);

    return {
      alreadyCheckedIn: false,
      currentStreak: updatedStreak.currentStreak,
      longestStreak: updatedStreak.longestStreak,
      xpAwarded,
      totalXp: newXpRecord.totalXp,
      level: newXpRecord.level,
      bonusMessages,
      message: `✅ Day ${newStreak} streak! +${xpAwarded} XP`,
    };
  }

  // ─────────────────────────────────────────────────────
  // POST /gamification/streak/freeze
  // ─────────────────────────────────────────────────────
  /**
   * Use a streak freeze to protect today's streak without checking in.
   * Consumes 1 freeze from the user's inventory.
   */
  async useStreakFreeze(userId: string) {
    const streak = await this.prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!streak || streak.freezes <= 0) {
      throw new BadRequestException(
        'No streak freezes remaining. Earn more by completing challenges!',
      );
    }

    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    if (streak.lastCheckIn && streak.lastCheckIn >= todayUTC) {
      throw new ConflictException(
        'You already checked in today — no need to use a freeze!',
      );
    }

    // Apply freeze: advance lastCheckIn to now without incrementing the streak
    const updated = await this.prisma.userStreak.update({
      where: { userId },
      data: {
        lastCheckIn: now,
        freezes: streak.freezes - 1,
        // streak count stays the same
      },
    });

    return {
      freezesRemaining: updated.freezes,
      currentStreak: updated.currentStreak,
      message: `❄️ Streak freeze used! ${updated.freezes} freeze(s) remaining.`,
    };
  }

  // ─────────────────────────────────────────────────────
  // INTERNAL — Shared XP & Badge Award Logic
  // ─────────────────────────────────────────────────────

  /**
   * Award XP to a user and recalculate their level.
   * Called by other modules (RegistrationsService, AttendanceService, etc.)
   * via EventEmitter2 listeners or direct injection.
   */
  async awardXp(
    userId: string,
    amount: number,
  ): Promise<{ totalXp: number; level: number; leveledUp: boolean }> {
    // Upsert XP record atomically
    const current = await this.prisma.userXp.upsert({
      where: { userId },
      update: { totalXp: { increment: amount } },
      create: { userId, totalXp: amount, level: 1 },
    });

    const newLevelInfo = calculateLevel(current.totalXp);
    const leveledUp = newLevelInfo.level !== current.level;

    if (leveledUp) {
      await this.prisma.userXp.update({
        where: { userId },
        data: { level: newLevelInfo.level },
      });
    }

    this.logger.log(
      `[XP] +${amount} XP to user ${userId} → total=${current.totalXp} level=${newLevelInfo.level}`,
    );
    return { totalXp: current.totalXp, level: newLevelInfo.level, leveledUp };
  }

  /**
   * Award a badge to a user (no-op if already earned).
   * Returns true if newly earned.
   */
  async awardBadgeIfNotEarned(
    userId: string,
    badgeName: string,
  ): Promise<boolean> {
    const badge = await this.prisma.badgeDefinition.findUnique({
      where: { name: badgeName },
    });
    if (!badge) return false;

    const existing = await this.prisma.userBadge.findFirst({
      where: { userId, badgeId: badge.id },
    });
    if (existing) return false; // Already earned

    await this.prisma.userBadge.create({ data: { userId, badgeId: badge.id } });

    // Award XP reward for earning the badge
    if (badge.xpReward > 0) {
      await this.awardXp(userId, badge.xpReward);
    }

    this.logger.log(`[BADGE] "${badgeName}" awarded to user ${userId}`);
    return true;
  }

  /**
   * Refresh the leaderboard cache (called by scheduled job every 5 minutes).
   */
  async refreshLeaderboardCache(): Promise<void> {
    this.logger.debug('[LEADERBOARD] Refreshing leaderboard cache...');

    const allXp = await this.prisma.userXp.findMany({
      orderBy: { totalXp: 'desc' },
      select: { userId: true, totalXp: true, level: true },
    });

    // Batch upsert all leaderboard positions
    await this.prisma.$transaction(
      allXp.map((entry, index) =>
        this.prisma.leaderboardCache.upsert({
          where: { userId: entry.userId },
          update: {
            rank: index + 1,
            totalXp: entry.totalXp,
            level: entry.level,
            updatedAt: new Date(),
          },
          create: {
            userId: entry.userId,
            rank: index + 1,
            totalXp: entry.totalXp,
            level: entry.level,
          },
        }),
      ),
    );

    this.logger.log(`[LEADERBOARD] Cache refreshed for ${allXp.length} users`);
  }

  /**
   * Check and award all eligible badges for a user based on their current activity stats.
   * Called after major events (registration, check-in, etc.)
   */
  async checkAndAwardBadges(userId: string): Promise<string[]> {
    const awarded: string[] = [];

    const [registrationCount, attendanceCount] = await Promise.all([
      this.prisma.eventRegistration.count({ where: { userId } }),
      this.prisma.attendance.count({ where: { userId } }),
    ]);

    // First Blood: first registration
    if (registrationCount >= 1) {
      const newlyEarned = await this.awardBadgeIfNotEarned(
        userId,
        'First Blood',
      );
      if (newlyEarned) awarded.push('First Blood');
    }

    // Fire Starter: attended 3 events
    if (attendanceCount >= 3) {
      const newlyEarned = await this.awardBadgeIfNotEarned(
        userId,
        'Fire Starter',
      );
      if (newlyEarned) awarded.push('Fire Starter');
    }

    // Event Royalty: attended 10 events
    if (attendanceCount >= 10) {
      const newlyEarned = await this.awardBadgeIfNotEarned(
        userId,
        'Event Royalty',
      );
      if (newlyEarned) awarded.push('Event Royalty');
    }

    if (awarded.length > 0) {
      this.logger.log(`[BADGES] Awarded to ${userId}: ${awarded.join(', ')}`);
    }

    return awarded;
  }
}
