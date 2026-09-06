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
            conversationId: string;
            content: string | null;
            isDeleted: boolean;
            senderId: string;
            replyToId: string | null;
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
            conversationId: string;
            content: string | null;
            isDeleted: boolean;
            senderId: string;
            replyToId: string | null;
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
            conversationId: string;
            content: string | null;
            isDeleted: boolean;
            senderId: string;
            replyToId: string | null;
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
            joinedAt: Date;
            conversationId: string;
            lastReadAt: Date;
        })[];
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        eventId: string | null;
        type: string;
    }[]>;
    createConversation(dto: CreateConversationDto, creatorId: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        eventId: string | null;
        type: string;
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
            conversationId: string;
            content: string | null;
            isDeleted: boolean;
            senderId: string;
            replyToId: string | null;
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
            joinedAt: Date;
            conversationId: string;
            lastReadAt: Date;
        })[];
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        eventId: string | null;
        type: string;
    }>;
    getMessages(conversationId: string, userId: string, query: MessageQueryDto): Promise<{
        messages: ({
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
            attachments: {
                id: string;
                createdAt: Date;
                fileUrl: string;
                fileType: string;
                fileSize: number;
                messageId: string;
            }[];
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
            conversationId: string;
            content: string | null;
            isDeleted: boolean;
            senderId: string;
            replyToId: string | null;
        })[];
        nextCursor: string | null;
    }>;
    sendMessage(conversationId: string, senderId: string, dto: SendMessageDto): Promise<{
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
        attachments: {
            id: string;
            createdAt: Date;
            fileUrl: string;
            fileType: string;
            fileSize: number;
            messageId: string;
        }[];
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
        conversationId: string;
        content: string | null;
        isDeleted: boolean;
        senderId: string;
        replyToId: string | null;
    }>;
    updateMessage(messageId: string, userId: string, dto: UpdateMessageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        conversationId: string;
        content: string | null;
        isDeleted: boolean;
        senderId: string;
        replyToId: string | null;
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
            conversationId: string;
            content: string | null;
            isDeleted: boolean;
            senderId: string;
            replyToId: string | null;
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
        conversationId: string;
        content: string | null;
        isDeleted: boolean;
        senderId: string;
        replyToId: string | null;
    }) | null>;
    moderateDeleteMessage(conversationId: string, messageId: string, actorId: string, hasGlobalPerm?: boolean): Promise<{
        message: string;
    }>;
    ensureEventConversation(eventId: string, eventName: string, creatorId?: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        eventId: string | null;
        type: string;
    }>;
    syncEventOrganizers(eventId: string): Promise<void>;
    addMemberToEventChat(eventId: string, userId: string, role?: 'ADMIN' | 'MEMBER'): Promise<{
        role: string;
        userId: string;
        joinedAt: Date;
        conversationId: string;
        lastReadAt: Date;
    } | undefined>;
    removeMemberFromEventChat(eventId: string, userId: string): Promise<void>;
    syncAllEvents(): Promise<{
        message: string;
    }>;
}
