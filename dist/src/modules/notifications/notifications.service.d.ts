import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
export type NotificationType = 'REGISTRATION_APPROVED' | 'REGISTRATION_REJECTED' | 'EVENT_REMINDER' | 'EVENT_UPDATED' | 'EXPENSE_APPROVED' | 'EXPENSE_REJECTED' | 'ANNOUNCEMENT' | 'CHAT_MESSAGE' | 'BADGE_EARNED' | 'LEVEL_UP' | 'WORKFLOW_ACTION_REQUIRED' | 'TICKET_GENERATED';
export interface SendNotificationPayload {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
}
export declare class NotificationsService implements OnModuleInit {
    private readonly prisma;
    private readonly configService;
    private readonly notifQueue;
    private readonly logger;
    private fcmInitialized;
    constructor(prisma: PrismaService, configService: ConfigService, notifQueue: Queue);
    onModuleInit(): void;
    getNotifications(userId: string, query: NotificationQueryDto): Promise<{
        items: {
            type: string;
            title: string;
            userId: string;
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/client").JsonValue | null;
            body: string;
            isRead: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            unreadCount: number;
        };
    }>;
    markRead(userId: string, dto: MarkReadDto): Promise<{
        markedRead: number;
    }>;
    getPreferences(userId: string): Promise<({
        type: string;
        userId: string;
        id: string;
        inAppEnabled: boolean;
        pushEnabled: boolean;
        emailEnabled: boolean;
    } | {
        userId: string;
        type: NotificationType;
        inAppEnabled: boolean;
        pushEnabled: boolean;
        emailEnabled: boolean;
    })[]>;
    updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<{
        type: string;
        userId: string;
        id: string;
        inAppEnabled: boolean;
        pushEnabled: boolean;
        emailEnabled: boolean;
    }[]>;
    registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        token: string;
        platform: string;
        lastUsed: Date;
    }>;
    removeDeviceToken(id: string, userId: string): Promise<{
        message: string;
    }>;
    send(payload: SendNotificationPayload): Promise<void>;
    createInAppNotification(payload: SendNotificationPayload): Promise<{
        type: string;
        title: string;
        userId: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        body: string;
        isRead: boolean;
    }>;
    sendFcmPush(userId: string, title: string, body: string, data?: Record<string, any>): Promise<void>;
    getPreferenceForType(userId: string, type: string): Promise<{
        inAppEnabled: boolean;
        pushEnabled: boolean;
        emailEnabled: boolean;
    }>;
}
