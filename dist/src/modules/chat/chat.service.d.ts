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
    } & {
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
}
