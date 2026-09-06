import { PrismaService } from '../../database/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class ChatService {
    private readonly prisma;
    private readonly eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    getMyConversations(userId: string): Promise<{
        currentUserRole: string;
        lastReadAt: Date;
        lastMessage: {
            sender: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string | null;
            replyToId: string | null;
            conversationId: string;
            isDeleted: boolean;
            senderId: string;
        };
        unreadCount: number;
        membersCount: number;
        pinnedMessage: ({
            sender: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string | null;
            replyToId: string | null;
            conversationId: string;
            isDeleted: boolean;
            senderId: string;
        }) | null;
        messages: ({
            sender: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string | null;
            replyToId: string | null;
            conversationId: string;
            isDeleted: boolean;
            senderId: string;
        })[];
        members: ({
            user: {
                id: string;
                email: string | null;
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
            };
        } & {
            role: string;
            userId: string;
            conversationId: string;
            joinedAt: Date;
            lastReadAt: Date;
        })[];
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        eventId: string | null;
    }[]>;
    createConversation(dto: CreateConversationDto, creatorId: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        eventId: string | null;
    }>;
    getConversationById(id: string, userId: string): Promise<{
        currentUserRole: string;
        membersCount: number;
        pinnedMessage: ({
            sender: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string | null;
            replyToId: string | null;
            conversationId: string;
            isDeleted: boolean;
            senderId: string;
        }) | null;
        members: ({
            user: {
                id: string;
                registrationNumber: string;
                email: string | null;
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
            };
        } & {
            role: string;
            userId: string;
            conversationId: string;
            joinedAt: Date;
            lastReadAt: Date;
        })[];
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        eventId: string | null;
    }>;
    getMessages(conversationId: string, userId: string, query: MessageQueryDto): Promise<{
        messages: ({
            attachments: {
                id: string;
                createdAt: Date;
                fileUrl: string;
                fileType: string;
                fileSize: number;
                messageId: string;
            }[];
            sender: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
            };
            replyTo: {
                id: string;
                content: string | null;
                sender: {
                    id: string;
                    profile: {
                        firstName: string;
                    } | null;
                };
            } | null;
            reactions: ({
                user: {
                    id: string;
                    profile: {
                        firstName: string;
                    } | null;
                };
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                emoji: string;
                messageId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string | null;
            replyToId: string | null;
            conversationId: string;
            isDeleted: boolean;
            senderId: string;
        })[];
        nextCursor: string | null;
    }>;
    sendMessage(conversationId: string, senderId: string, dto: SendMessageDto): Promise<{
        attachments: {
            id: string;
            createdAt: Date;
            fileUrl: string;
            fileType: string;
            fileSize: number;
            messageId: string;
        }[];
        sender: {
            id: string;
            profile: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            } | null;
        };
        replyTo: {
            id: string;
            content: string | null;
            senderId: string;
        } | null;
        reactions: {
            id: string;
            createdAt: Date;
            userId: string;
            emoji: string;
            messageId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string | null;
        replyToId: string | null;
        conversationId: string;
        isDeleted: boolean;
        senderId: string;
    }>;
    updateMessage(messageId: string, userId: string, dto: UpdateMessageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string | null;
        replyToId: string | null;
        conversationId: string;
        isDeleted: boolean;
        senderId: string;
    }>;
    deleteMessage(messageId: string, userId: string): Promise<{
        message: string;
    }>;
    addReaction(messageId: string, userId: string, emoji: string): Promise<{
        user: {
            id: string;
            profile: {
                firstName: string;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        emoji: string;
        messageId: string;
    }>;
    removeReaction(messageId: string, userId: string, emoji: string): Promise<{
        message: string;
    }>;
    markAsRead(conversationId: string, userId: string): Promise<{
        message: string;
    }>;
    private assertMember;
    private assertMessageOwner;
    getConversationMembers(conversationId: string, userId: string): Promise<{
        id: string;
        userId: string;
        role: string;
        joinedAt: Date;
        registrationNumber: string;
        name: string;
        avatarUrl: string | null;
        isOrganizer: boolean;
    }[]>;
    kickMember(conversationId: string, targetUserId: string, actorId: string, hasGlobalPerm?: boolean): Promise<{
        message: string;
    }>;
    pinMessage(conversationId: string, messageId: string, actorId: string, hasGlobalPerm?: boolean): Promise<{
        message: string;
        pinnedMessage: {
            sender: {
                id: string;
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            content: string | null;
            replyToId: string | null;
            conversationId: string;
            isDeleted: boolean;
            senderId: string;
        };
    }>;
    unpinMessage(conversationId: string, actorId: string, hasGlobalPerm?: boolean): Promise<{
        message: string;
    }>;
    getPinnedMessage(conversationId: string): Promise<({
        sender: {
            id: string;
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string | null;
        replyToId: string | null;
        conversationId: string;
        isDeleted: boolean;
        senderId: string;
    }) | null>;
    moderateDeleteMessage(conversationId: string, messageId: string, actorId: string, hasGlobalPerm?: boolean): Promise<{
        message: string;
    }>;
    ensureEventConversation(eventId: string, eventName: string, creatorId?: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        eventId: string | null;
    }>;
    syncEventOrganizers(eventId: string): Promise<void>;
    addMemberToEventChat(eventId: string, userId: string, role?: 'ADMIN' | 'MEMBER'): Promise<{
        role: string;
        userId: string;
        conversationId: string;
        joinedAt: Date;
        lastReadAt: Date;
    } | undefined>;
    removeMemberFromEventChat(eventId: string, userId: string): Promise<void>;
    syncAllEvents(): Promise<{
        message: string;
    }>;
}
