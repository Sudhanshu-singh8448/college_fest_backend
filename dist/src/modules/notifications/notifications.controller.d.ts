import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(query: NotificationQueryDto, user: any): Promise<{
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
    markRead(dto: MarkReadDto, user: any): Promise<{
        markedRead: number;
    }>;
    getPreferences(user: any): Promise<({
        type: string;
        userId: string;
        id: string;
        inAppEnabled: boolean;
        pushEnabled: boolean;
        emailEnabled: boolean;
    } | {
        userId: string;
        type: import("./notifications.service").NotificationType;
        inAppEnabled: boolean;
        pushEnabled: boolean;
        emailEnabled: boolean;
    })[]>;
    updatePreferences(dto: UpdatePreferencesDto, user: any): Promise<{
        type: string;
        userId: string;
        id: string;
        inAppEnabled: boolean;
        pushEnabled: boolean;
        emailEnabled: boolean;
    }[]>;
    registerDeviceToken(dto: RegisterDeviceTokenDto, user: any): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        token: string;
        platform: string;
        lastUsed: Date;
    }>;
    removeDeviceToken(id: string, user: any): Promise<{
        message: string;
    }>;
}
