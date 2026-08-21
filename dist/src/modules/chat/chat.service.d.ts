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
        lastReadAt: Date;
        lastMessage: {
            sender: {
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
                id: string;
            };
        } & {
            type: string;
            content: string | null;
            replyToId: string | null;
            conversationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            senderId: string;
        };
        unreadCount: number;
        messages: ({
            sender: {
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
                id: string;
            };
        } & {
            type: string;
            content: string | null;
            replyToId: string | null;
            conversationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            senderId: string;
        })[];
        members: ({
            user: {
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
                id: string;
                email: string | null;
            };
        } & {
            role: string;
            conversationId: string;
            userId: string;
            joinedAt: Date;
            lastReadAt: Date;
        })[];
        type: string;
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string | null;
    }[]>;
    createConversation(dto: CreateConversationDto, creatorId: string): Promise<{
        type: string;
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string | null;
    }>;
    getConversationById(id: string, userId: string): Promise<{
        members: ({
            user: {
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
                id: string;
                registrationNumber: string;
                email: string | null;
            };
        } & {
            role: string;
            conversationId: string;
            userId: string;
            joinedAt: Date;
            lastReadAt: Date;
        })[];
    } & {
        type: string;
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
                id: string;
            };
            replyTo: {
                content: string | null;
                id: string;
                sender: {
                    profile: {
                        firstName: string;
                    } | null;
                    id: string;
                };
            } | null;
            reactions: ({
                user: {
                    profile: {
                        firstName: string;
                    } | null;
                    id: string;
                };
            } & {
                userId: string;
                id: string;
                createdAt: Date;
                emoji: string;
                messageId: string;
            })[];
        } & {
            type: string;
            content: string | null;
            replyToId: string | null;
            conversationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            profile: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            } | null;
            id: string;
        };
        replyTo: {
            content: string | null;
            id: string;
            senderId: string;
        } | null;
        reactions: {
            userId: string;
            id: string;
            createdAt: Date;
            emoji: string;
            messageId: string;
        }[];
    } & {
        type: string;
        content: string | null;
        replyToId: string | null;
        conversationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        senderId: string;
    }>;
    updateMessage(messageId: string, userId: string, dto: UpdateMessageDto): Promise<{
        type: string;
        content: string | null;
        replyToId: string | null;
        conversationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        senderId: string;
    }>;
    deleteMessage(messageId: string, userId: string): Promise<{
        message: string;
    }>;
    addReaction(messageId: string, userId: string, emoji: string): Promise<{
        user: {
            profile: {
                firstName: string;
            } | null;
            id: string;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
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
}
