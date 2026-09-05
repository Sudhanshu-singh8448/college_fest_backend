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
var GamificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const gamification_constants_1 = require("./gamification.constants");
let GamificationService = GamificationService_1 = class GamificationService {
    prisma;
    logger = new common_1.Logger(GamificationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyProfile(userId) {
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
        const levelInfo = (0, gamification_constants_1.calculateLevel)(totalXp);
        const xpForCurrentLevel = ([
            100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 12000, 22000, 36000,
            50000,
        ].find((_, i, arr) => totalXp < (arr[i] ?? Infinity)) ?? 0) -
            (levelInfo.nextLevelXp ? levelInfo.nextLevelXp - 1 : 0);
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
                    freezesRemaining: gamification_constants_1.DEFAULT_FREEZE_COUNT,
                    lastCheckIn: null,
                },
        };
    }
    async getLeaderboard(query) {
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
                levelName: (0, gamification_constants_1.calculateLevel)(e.totalXp).name,
                user: userMap[e.userId] ?? null,
            })),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            refreshedAt: entries[0]?.updatedAt ?? null,
        };
    }
    async getMyRank(userId) {
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
            levelName: (0, gamification_constants_1.calculateLevel)(entry.totalXp).name,
            xpToNextRank: above ? above.totalXp - entry.totalXp + 1 : null,
            nearbyRanks: { above, below },
        };
    }
    async getAllBadges() {
        return this.prisma.badgeDefinition.findMany({
            orderBy: { xpReward: 'desc' },
        });
    }
    async getMyBadges(userId) {
        const badges = await this.prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
            orderBy: { earnedAt: 'desc' },
        });
        const totalAvailable = await this.prisma.badgeDefinition.count();
        return {
            earned: badges.map((b) => ({ ...b.badge, earnedAt: b.earnedAt })),
            total: badges.length,
            totalAvailable,
            completionPercent: Math.round((badges.length / totalAvailable) * 100),
        };
    }
    async checkIn(userId) {
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const yesterdayUTC = new Date(todayUTC.getTime() - 86_400_000);
        let streak = await this.prisma.userStreak.findUnique({ where: { userId } });
        if (!streak) {
            streak = await this.prisma.userStreak.create({
                data: {
                    userId,
                    currentStreak: 0,
                    longestStreak: 0,
                    freezes: gamification_constants_1.DEFAULT_FREEZE_COUNT,
                },
            });
        }
        if (streak.lastCheckIn && streak.lastCheckIn >= todayUTC) {
            return {
                alreadyCheckedIn: true,
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                message: 'Already checked in today! Come back tomorrow.',
            };
        }
        const isConsecutive = streak.lastCheckIn && streak.lastCheckIn >= yesterdayUTC;
        const newStreak = isConsecutive ? streak.currentStreak + 1 : 1;
        const newLongest = Math.max(newStreak, streak.longestStreak);
        let xpAwarded = gamification_constants_1.XP_REWARDS.DAILY_LOGIN;
        const bonusMessages = [];
        if (newStreak === 7) {
            xpAwarded += gamification_constants_1.XP_REWARDS.STREAK_7_DAYS;
            bonusMessages.push(`🔥 7-day streak bonus! +${gamification_constants_1.XP_REWARDS.STREAK_7_DAYS} XP`);
            await this.awardBadgeIfNotEarned(userId, 'Digital Native');
        }
        if (newStreak === 30) {
            xpAwarded += gamification_constants_1.XP_REWARDS.STREAK_30_DAYS;
            bonusMessages.push(`🏆 30-day streak bonus! +${gamification_constants_1.XP_REWARDS.STREAK_30_DAYS} XP`);
        }
        if (now.getHours() < 4) {
            await this.awardBadgeIfNotEarned(userId, 'Night Owl');
        }
        const updatedStreak = await this.prisma.userStreak.update({
            where: { userId },
            data: {
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastCheckIn: now,
            },
        });
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
    async useStreakFreeze(userId) {
        const streak = await this.prisma.userStreak.findUnique({
            where: { userId },
        });
        if (!streak || streak.freezes <= 0) {
            throw new common_1.BadRequestException('No streak freezes remaining. Earn more by completing challenges!');
        }
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        if (streak.lastCheckIn && streak.lastCheckIn >= todayUTC) {
            throw new common_1.ConflictException('You already checked in today — no need to use a freeze!');
        }
        const updated = await this.prisma.userStreak.update({
            where: { userId },
            data: {
                lastCheckIn: now,
                freezes: streak.freezes - 1,
            },
        });
        return {
            freezesRemaining: updated.freezes,
            currentStreak: updated.currentStreak,
            message: `❄️ Streak freeze used! ${updated.freezes} freeze(s) remaining.`,
        };
    }
    async awardXp(userId, amount) {
        const current = await this.prisma.userXp.upsert({
            where: { userId },
            update: { totalXp: { increment: amount } },
            create: { userId, totalXp: amount, level: 1 },
        });
        const newLevelInfo = (0, gamification_constants_1.calculateLevel)(current.totalXp);
        const leveledUp = newLevelInfo.level !== current.level;
        if (leveledUp) {
            await this.prisma.userXp.update({
                where: { userId },
                data: { level: newLevelInfo.level },
            });
        }
        this.logger.log(`[XP] +${amount} XP to user ${userId} → total=${current.totalXp} level=${newLevelInfo.level}`);
        return { totalXp: current.totalXp, level: newLevelInfo.level, leveledUp };
    }
    async awardBadgeIfNotEarned(userId, badgeName) {
        const badge = await this.prisma.badgeDefinition.findUnique({
            where: { name: badgeName },
        });
        if (!badge)
            return false;
        const existing = await this.prisma.userBadge.findFirst({
            where: { userId, badgeId: badge.id },
        });
        if (existing)
            return false;
        await this.prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
        if (badge.xpReward > 0) {
            await this.awardXp(userId, badge.xpReward);
        }
        this.logger.log(`[BADGE] "${badgeName}" awarded to user ${userId}`);
        return true;
    }
    async refreshLeaderboardCache() {
        this.logger.debug('[LEADERBOARD] Refreshing leaderboard cache...');
        const allXp = await this.prisma.userXp.findMany({
            orderBy: { totalXp: 'desc' },
            select: { userId: true, totalXp: true, level: true },
        });
        await this.prisma.$transaction(allXp.map((entry, index) => this.prisma.leaderboardCache.upsert({
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
        })));
        this.logger.log(`[LEADERBOARD] Cache refreshed for ${allXp.length} users`);
    }
    async checkAndAwardBadges(userId) {
        const awarded = [];
        const [registrationCount, attendanceCount] = await Promise.all([
            this.prisma.eventRegistration.count({ where: { userId } }),
            this.prisma.attendance.count({ where: { userId } }),
        ]);
        if (registrationCount >= 1) {
            const newlyEarned = await this.awardBadgeIfNotEarned(userId, 'First Blood');
            if (newlyEarned)
                awarded.push('First Blood');
        }
        if (attendanceCount >= 3) {
            const newlyEarned = await this.awardBadgeIfNotEarned(userId, 'Fire Starter');
            if (newlyEarned)
                awarded.push('Fire Starter');
        }
        if (attendanceCount >= 10) {
            const newlyEarned = await this.awardBadgeIfNotEarned(userId, 'Event Royalty');
            if (newlyEarned)
                awarded.push('Event Royalty');
        }
        if (awarded.length > 0) {
            this.logger.log(`[BADGES] Awarded to ${userId}: ${awarded.join(', ')}`);
        }
        return awarded;
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = GamificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map