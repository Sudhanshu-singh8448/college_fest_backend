import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import * as admin from 'firebase-admin';

// -----------------------------------------------------------------
// Notification types catalogue
// -----------------------------------------------------------------
export type NotificationType =
  | 'REGISTRATION_APPROVED'
  | 'REGISTRATION_REJECTED'
  | 'EVENT_REMINDER'
  | 'EVENT_UPDATED'
  | 'EXPENSE_APPROVED'
  | 'EXPENSE_REJECTED'
  | 'ANNOUNCEMENT'
  | 'CHAT_MESSAGE'
  | 'BADGE_EARNED'
  | 'LEVEL_UP'
  | 'WORKFLOW_ACTION_REQUIRED'
  | 'TICKET_GENERATED';

export interface SendNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private fcmInitialized = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue('notifications') private readonly notifQueue: Queue,
  ) {}

  onModuleInit() {
    // Initialize Firebase Admin SDK lazily (only if credentials provided)
    const serviceAccountJson = this.configService.get<string>(
      'FCM_SERVICE_ACCOUNT_JSON',
    );
    if (serviceAccountJson && admin.apps.length === 0) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
        });
        this.fcmInitialized = true;
        this.logger.log('Firebase Admin SDK initialized');
      } catch (e) {
        this.logger.warn(
          'Firebase Admin init failed — push notifications disabled',
        );
      }
    }
  }

  // ─────────────────────────────────────────────────────
  // PUBLIC API — REST ENDPOINTS
  // ─────────────────────────────────────────────────────

  /**
   * GET /notifications
   * Fetch paginated notifications for the current user.
   */
  async getNotifications(userId: string, query: NotificationQueryDto) {
    const { page = 1, limit = 20, unreadOnly } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

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

  /**
   * POST /notifications/read
   * Mark specific or all notifications as read.
   */
  async markRead(userId: string, dto: MarkReadDto) {
    const where: any = { userId, isRead: false };
    if (dto.ids && dto.ids.length > 0) {
      where.id = { in: dto.ids };
    }

    const result = await this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    return { markedRead: result.count };
  }

  /**
   * GET /notifications/preferences
   * Get per-type notification preferences for the current user.
   */
  async getPreferences(userId: string) {
    const stored = await this.prisma.notificationPreference.findMany({
      where: { userId },
    });

    // Fill in defaults for missing types
    const allTypes: NotificationType[] = [
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
      return (
        pref ?? {
          userId,
          type,
          inAppEnabled: true,
          pushEnabled: type !== 'CHAT_MESSAGE', // Chat gets batched, not per-message push
          emailEnabled: [
            'REGISTRATION_APPROVED',
            'REGISTRATION_REJECTED',
            'ANNOUNCEMENT',
          ].includes(type),
        }
      );
    });
  }

  /**
   * PUT /notifications/preferences
   * Upsert per-type notification preferences.
   */
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const upserts = dto.preferences.map((pref) =>
      this.prisma.notificationPreference.upsert({
        where: { userId_type: { userId, type: pref.type! } },
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
          type: pref.type!,
          inAppEnabled: pref.inAppEnabled ?? true,
          pushEnabled: pref.pushEnabled ?? true,
          emailEnabled: pref.emailEnabled ?? false,
        },
      }),
    );

    return Promise.all(upserts);
  }

  /**
   * POST /device-tokens
   * Register an FCM device token for the user.
   * Upserts by token value to avoid duplicates.
   */
  async registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto) {
    return this.prisma.deviceToken.upsert({
      where: { token: dto.token },
      update: { userId, platform: dto.platform, lastUsed: new Date() },
      create: { userId, token: dto.token, platform: dto.platform },
    });
  }

  /**
   * DELETE /device-tokens/:id
   * Remove a device token (logout / token rotation).
   */
  async removeDeviceToken(id: string, userId: string) {
    const token = await this.prisma.deviceToken.findUnique({ where: { id } });
    if (!token) throw new NotFoundException('Device token not found');
    if (token.userId !== userId)
      throw new NotFoundException('Device token not found');

    await this.prisma.deviceToken.delete({ where: { id } });
    return { message: 'Device token removed' };
  }

  // ─────────────────────────────────────────────────────
  // INTERNAL — Used by other modules to dispatch notifications
  // ─────────────────────────────────────────────────────

  /**
   * Enqueue a notification job.
   * Called by other modules (RegistrationsService, WorkflowService, etc.)
   */
  async send(payload: SendNotificationPayload) {
    await this.notifQueue.add('dispatch', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  /**
   * Direct in-app notification creation (called by the BullMQ processor).
   * Creates DB record + (optionally) emits via WebSocket.
   */
  async createInAppNotification(payload: SendNotificationPayload) {
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

  /**
   * Send FCM push notification to all active device tokens for a user.
   */
  async sendFcmPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    if (!this.fcmInitialized) {
      this.logger.debug('FCM not initialized — skipping push');
      return;
    }

    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId },
    });
    if (tokens.length === 0) return;

    const messages: admin.messaging.Message[] = tokens.map((t) => ({
      token: t.token,
      notification: { title, body },
      data: data
        ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)]),
          )
        : undefined,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    }));

    try {
      const response = await admin.messaging().sendEach(messages);
      this.logger.log(
        `FCM: sent=${response.successCount} failed=${response.failureCount}`,
      );

      // Clean up invalid tokens
      const invalidTokenIds = response.responses
        .map((r, i) =>
          !r.success &&
          r.error?.code === 'messaging/registration-token-not-registered'
            ? tokens[i].id
            : null,
        )
        .filter(Boolean) as string[];

      if (invalidTokenIds.length > 0) {
        await this.prisma.deviceToken.deleteMany({
          where: { id: { in: invalidTokenIds } },
        });
        this.logger.log(`Removed ${invalidTokenIds.length} invalid FCM tokens`);
      }
    } catch (e) {
      this.logger.error('FCM batch send failed', e);
    }
  }

  /**
   * Get user notification preferences for a specific type.
   */
  async getPreferenceForType(userId: string, type: string) {
    const pref = await this.prisma.notificationPreference.findUnique({
      where: { userId_type: { userId, type } },
    });

    // Default preferences
    return {
      inAppEnabled: pref?.inAppEnabled ?? true,
      pushEnabled: pref?.pushEnabled ?? true,
      emailEnabled: pref?.emailEnabled ?? false,
    };
  }
}
