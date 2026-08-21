import { PrismaService } from '../../../database/prisma.service';
import { NotificationsService } from '../notifications.service';
import { GamificationService } from '../../gamification/gamification.service';
export declare class ScheduledJobsService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly gamificationService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, gamificationService: GamificationService);
    sendEventReminders(): Promise<void>;
    cleanupExpiredTokens(): Promise<void>;
    sendNotificationDigest(): Promise<void>;
    takeAnalyticsSnapshot(): Promise<void>;
    cleanupOrphanedFiles(): Promise<void>;
    refreshLeaderboard(): Promise<void>;
    checkStreaks(): Promise<void>;
}
