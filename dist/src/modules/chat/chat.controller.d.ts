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
    createConversation(dto: CreateConversationDto, user: any): Promise<{
        type: string;
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string | null;
    }>;
    getConversationById(id: string, user: any): Promise<{
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
    updateMessage(id: string, dto: UpdateMessageDto, user: any): Promise<{
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
    deleteMessage(id: string, user: any): Promise<{
        message: string;
    }>;
    addReaction(id: string, dto: AddReactionDto, user: any): Promise<{
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
    removeReaction(id: string, emoji: string, user: any): Promise<{
        message: string;
    }>;
    markAsRead(id: string, user: any): Promise<{
        message: string;
    }>;
}
