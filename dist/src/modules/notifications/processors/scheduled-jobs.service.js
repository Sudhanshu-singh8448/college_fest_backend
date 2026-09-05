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
var ScheduledJobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledJobsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../database/prisma.service");
const notifications_service_1 = require("../notifications.service");
const gamification_service_1 = require("../../gamification/gamification.service");
let ScheduledJobsService = ScheduledJobsService_1 = class ScheduledJobsService {
    prisma;
    notificationsService;
    gamificationService;
    logger = new common_1.Logger(ScheduledJobsService_1.name);
    constructor(prisma, notificationsService, gamificationService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.gamificationService = gamificationService;
    }
    async sendEventReminders() {
        this.logger.debug('[CRON] sendEventReminders');
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const upcomingEvents = await this.prisma.event.findMany({
            where: {
                startDate: { gte: fifteenMinutesAgo, lte: oneHourFromNow },
                status: { in: ['REGISTRATION_CLOSED', 'IN_PROGRESS'] },
                deletedAt: null,
            },
        });
        for (const event of upcomingEvents) {
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
        this.logger.log(`[CRON] Sent reminders for ${upcomingEvents.length} events`);
    }
    async cleanupExpiredTokens() {
        this.logger.debug('[CRON] cleanupExpiredTokens');
        const now = new Date();
        const result = await this.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: now } },
        });
        this.logger.log(`[CRON] Deleted ${result.count} expired refresh tokens`);
    }
    async sendNotificationDigest() {
        this.logger.debug('[CRON] sendNotificationDigest');
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const usersWithUnread = await this.prisma.notification.groupBy({
            by: ['userId'],
            where: { isRead: false, createdAt: { lt: sixHoursAgo } },
            _count: { id: true },
        });
        for (const entry of usersWithUnread) {
            const count = entry._count.id;
            if (count < 3)
                continue;
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
        this.logger.log(`[CRON] Daily snapshot — users:${totalUsers} regs_today:${totalRegistrations} events:${totalEvents}`);
    }
    async cleanupOrphanedFiles() {
        this.logger.debug('[CRON] cleanupOrphanedFiles');
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await this.prisma.file.deleteMany({
            where: { status: 'ORPHANED', createdAt: { lt: cutoff } },
        });
        this.logger.log(`[CRON] Deleted ${result.count} orphaned file records`);
    }
    async refreshLeaderboard() {
        this.logger.debug('[CRON] refreshLeaderboard');
        await this.gamificationService.refreshLeaderboardCache();
    }
    async checkStreaks() {
        this.logger.debug('[CRON] checkStreaks');
        this.logger.debug('[CRON] checkStreaks — streak logic deferred to Phase 10 (Gamification)');
    }
};
exports.ScheduledJobsService = ScheduledJobsService;
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobsService.prototype, "sendEventReminders", null);
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobsService.prototype, "cleanupExpiredTokens", null);
__decorate([
    (0, schedule_1.Cron)('0 */6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobsService.prototype, "sendNotificationDigest", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobsService.prototype, "takeAnalyticsSnapshot", null);
__decorate([
    (0, schedule_1.Cron)('0 4 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobsService.prototype, "cleanupOrphanedFiles", null);
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobsService.prototype, "refreshLeaderboard", null);
__decorate([
    (0, schedule_1.Cron)('0 1 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledJobsService.prototype, "checkStreaks", null);
exports.ScheduledJobsService = ScheduledJobsService = ScheduledJobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        gamification_service_1.GamificationService])
], ScheduledJobsService);
//# sourceMappingURL=scheduled-jobs.service.js.map