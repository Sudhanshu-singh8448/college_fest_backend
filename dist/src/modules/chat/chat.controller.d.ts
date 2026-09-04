import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { MessageQueryDto } from './dto/message-query.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMyConversations(user: any): Promise<{
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
    createConversation(dto: CreateConversationDto, user: any): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        eventId: string | null;
    }>;
    getConversationById(id: string, user: any): Promise<{
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
    getMessages(id: string, query: MessageQueryDto, user: any): Promise<{
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
    sendMessage(id: string, dto: SendMessageDto, user: any): Promise<{
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
    updateMessage(id: string, dto: UpdateMessageDto, user: any): Promise<{
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
    deleteMessage(id: string, user: any): Promise<{
        message: string;
    }>;
    addReaction(id: string, dto: AddReactionDto, user: any): Promise<{
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
    removeReaction(id: string, emoji: string, user: any): Promise<{
        message: string;
    }>;
    markAsRead(id: string, user: any): Promise<{
        message: string;
    }>;
}
