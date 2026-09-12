"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
const event_emitter_1 = require("@nestjs/event-emitter");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    configService;
    eventEmitter;
    notifQueue;
    logger = new common_1.Logger(NotificationsService_1.name);
    fcmInitialized = false;
    constructor(prisma, configService, eventEmitter, notifQueue) {
        this.prisma = prisma;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.notifQueue = notifQueue;
    }
    onModuleInit() {
        const rawJson = this.configService.get('FCM_SERVICE_ACCOUNT_JSON');
        const filePath = this.configService.get('FCM_SERVICE_ACCOUNT_PATH');
        if (admin.apps.length === 0 && (rawJson || filePath)) {
            try {
                let certData = null;
                if (filePath && fs.existsSync(filePath)) {
                    certData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                }
                else if (rawJson) {
                    const trimmed = rawJson.trim();
                    if (trimmed.startsWith('{')) {
                        certData = JSON.parse(trimmed);
                    }
                    else if (fs.existsSync(trimmed)) {
                        certData = JSON.parse(fs.readFileSync(trimmed, 'utf-8'));
                    }
                }
                if (certData) {
                    if (certData.private_key && typeof certData.private_key === 'string') {
                        certData.private_key = certData.private_key.replace(/\\n/g, '\n');
                    }
                    admin.initializeApp({
                        credential: admin.credential.cert(certData),
                    });
                    this.fcmInitialized = true;
                    this.logger.log('✅ Firebase Admin SDK initialized successfully');
                }
                else {
                    this.logger.warn('Firebase credentials file or JSON not found — push notifications disabled');
                }
            }
            catch (e) {
                this.logger.warn(`Firebase Admin init failed (${e instanceof Error ? e.message : e}) — push notifications disabled`);
            }
        }
    }
    async getNotifications(userId, query) {
        const { page = 1, limit = 20, unreadOnly } = query;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (unreadOnly)
            where.isRead = false;
        const [items, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    }
    async markRead(userId, dto) {
        const where = { userId, isRead: false };
        if (dto.ids && dto.ids.length > 0) {
            where.id = { in: dto.ids };
        }
        const result = await this.prisma.notification.updateMany({
            where,
            data: { isRead: true },
        });
        return { markedRead: result.count };
    }
    async getPreferences(userId) {
        const stored = await this.prisma.notificationPreference.findMany({
            where: { userId },
        });
        const allTypes = [
            'REGISTRATION_APPROVED',
            'REGISTRATION_REJECTED',
            'EVENT_REMINDER',
            'EVENT_UPDATED',
            'EXPENSE_APPROVED',
            'EXPENSE_REJECTED',
            'ANNOUNCEMENT',
            'CHAT_MESSAGE',
            'BADGE_EARNED',
            'LEVEL_UP',
            'WORKFLOW_ACTION_REQUIRED',
            'TICKET_GENERATED',
        ];
        return allTypes.map((type) => {
            const pref = stored.find((p) => p.type === type);
            return (pref ?? {
                userId,
                type,
                inAppEnabled: true,
                pushEnabled: type !== 'CHAT_MESSAGE',
                emailEnabled: [
                    'REGISTRATION_APPROVED',
                    'REGISTRATION_REJECTED',
                    'ANNOUNCEMENT',
                ].includes(type),
            });
        });
    }
    async updatePreferences(userId, dto) {
        const upserts = dto.preferences.map((pref) => this.prisma.notificationPreference.upsert({
            where: { userId_type: { userId, type: pref.type } },
            update: {
                ...(pref.inAppEnabled !== undefined && {
                    inAppEnabled: pref.inAppEnabled,
                }),
                ...(pref.pushEnabled !== undefined && {
                    pushEnabled: pref.pushEnabled,
                }),
                ...(pref.emailEnabled !== undefined && {
                    emailEnabled: pref.emailEnabled,
                }),
            },
            create: {
                userId,
                type: pref.type,
                inAppEnabled: pref.inAppEnabled ?? true,
                pushEnabled: pref.pushEnabled ?? true,
                emailEnabled: pref.emailEnabled ?? false,
            },
        }));
        return Promise.all(upserts);
    }
    async registerDeviceToken(userId, dto) {
        return this.prisma.deviceToken.upsert({
            where: { token: dto.token },
            update: { userId, platform: dto.platform, lastUsed: new Date() },
            create: { userId, token: dto.token, platform: dto.platform },
        });
    }
    async removeDeviceToken(id, userId) {
        const token = await this.prisma.deviceToken.findUnique({ where: { id } });
        if (!token)
            throw new common_1.NotFoundException('Device token not found');
        if (token.userId !== userId)
            throw new common_1.NotFoundException('Device token not found');
        await this.prisma.deviceToken.delete({ where: { id } });
        return { message: 'Device token removed' };
    }
    async send(payload) {
        await this.notifQueue.add('dispatch', payload, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
        });
    }
    async createInAppNotification(payload) {
        return this.prisma.notification.create({
            data: {
                userId: payload.userId,
                type: payload.type,
                title: payload.title,
                body: payload.body,
                data: payload.data ?? {},
            },
        });
    }
    async sendFcmPush(userId, title, body, data) {
        if (!this.fcmInitialized) {
            this.logger.debug('FCM not initialized — skipping push');
            return;
        }
        const tokens = await this.prisma.deviceToken.findMany({
            where: { userId },
        });
        if (tokens.length === 0)
            return;
        const messages = tokens.map((t) => ({
            token: t.token,
            notification: { title, body },
            data: data
                ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
                : undefined,
            android: { priority: 'high' },
            apns: { payload: { aps: { sound: 'default' } } },
        }));
        try {
            const response = await admin.messaging().sendEach(messages);
            this.logger.log(`FCM: sent=${response.successCount} failed=${response.failureCount}`);
            const invalidTokenIds = response.responses
                .map((r, i) => !r.success &&
                r.error?.code === 'messaging/registration-token-not-registered'
                ? tokens[i].id
                : null)
                .filter(Boolean);
            if (invalidTokenIds.length > 0) {
                await this.prisma.deviceToken.deleteMany({
                    where: { id: { in: invalidTokenIds } },
                });
                this.logger.log(`Removed ${invalidTokenIds.length} invalid FCM tokens`);
            }
        }
        catch (e) {
            this.logger.error('FCM batch send failed', e);
        }
    }
    async getPreferenceForType(userId, type) {
        const pref = await this.prisma.notificationPreference.findUnique({
            where: { userId_type: { userId, type } },
        });
        return {
            inAppEnabled: pref?.inAppEnabled ?? true,
            pushEnabled: pref?.pushEnabled ?? true,
            emailEnabled: pref?.emailEnabled ?? false,
        };
    }
    async broadcast(actorId, dto) {
        let targetEvents = [];
        if (dto.eventId) {
            const event = await this.prisma.event.findUnique({
                where: { id: dto.eventId },
                select: { id: true, name: true },
            });
            if (event)
                targetEvents = [event];
        }
        else if (dto.category) {
            targetEvents = await this.prisma.event.findMany({
                where: { category: dto.category, deletedAt: null },
                select: { id: true, name: true },
            });
        }
        else {
            targetEvents = await this.prisma.event.findMany({
                where: {
                    organizers: { some: { userId: actorId } },
                    deletedAt: null,
                },
                select: { id: true, name: true },
            });
            if (targetEvents.length === 0) {
                targetEvents = await this.prisma.event.findMany({
                    where: { status: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'STARTED', 'ONGOING'] }, deletedAt: null },
                    select: { id: true, name: true },
                    take: 20,
                });
            }
        }
        if (targetEvents.length === 0) {
            throw new common_1.NotFoundException('No target events found for broadcast');
        }
        const eventIds = targetEvents.map((e) => e.id);
        const conversations = await this.prisma.conversation.findMany({
            where: { eventId: { in: eventIds } },
            select: { id: true, eventId: true },
        });
        for (const conv of conversations) {
            try {
                const msg = await this.prisma.message.create({
                    data: {
                        conversationId: conv.id,
                        senderId: actorId,
                        content: `📢 [BROADCAST: ${dto.priority || 'NORMAL'}]\n\n**${dto.title}**\n\n${dto.message}`,
                        type: 'TEXT',
                    },
                });
                this.eventEmitter.emit('chat.message.new', {
                    conversationId: conv.id,
                    message: msg,
                });
            }
            catch (err) {
                this.logger.warn(`Failed to inject broadcast message into conv ${conv.id}: ${err}`);
            }
        }
        const registrations = await this.prisma.eventRegistration.findMany({
            where: {
                eventId: { in: eventIds },
                status: { in: ['APPROVED', 'CHECKED_IN'] },
            },
            select: { userId: true },
            distinct: ['userId'],
        });
        if (registrations.length > 0) {
            await this.prisma.notification.createMany({
                data: registrations.map((r) => ({
                    userId: r.userId,
                    type: 'ANNOUNCEMENT',
                    title: `📢 ${dto.title}`,
                    body: dto.message,
                    data: {
                        priority: dto.priority || 'NORMAL',
                        eventIds,
                    },
                })),
                skipDuplicates: true,
            });
            const userIds = registrations.map((r) => r.userId);
            this.sendBatchPush(userIds, `📢 ${dto.title}`, dto.message, {
                priority: dto.priority || 'NORMAL',
            }).catch((e) => this.logger.error('Background batch push failed', e));
        }
        return {
            success: true,
            message: 'Broadcast sent successfully',
            targetEventsCount: targetEvents.length,
            notifiedUsersCount: registrations.length,
            events: targetEvents,
        };
    }
    async sendBatchPush(userIds, title, body, data) {
        if (!this.fcmInitialized)
            return;
        const tokens = await this.prisma.deviceToken.findMany({
            where: { userId: { in: userIds } },
            select: { token: true, id: true },
        });
        if (tokens.length === 0)
            return;
        for (let i = 0; i < tokens.length; i += 500) {
            const slice = tokens.slice(i, i + 500);
            const messages = slice.map((t) => ({
                token: t.token,
                notification: { title, body },
                data: data
                    ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
                    : undefined,
            }));
            try {
                await admin.messaging().sendEach(messages);
            }
            catch (e) {
                this.logger.error('FCM chunk send error', e);
            }
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        event_emitter_1.EventEmitter2,
        bullmq_2.Queue])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map