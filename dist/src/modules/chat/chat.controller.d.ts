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
    createConversation(dto: CreateConversationDto, user: any): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        eventId: string | null;
        type: string;
    }>;
    getConversationById(id: string, user: any): Promise<{
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
    getMessages(id: string, query: MessageQueryDto, user: any): Promise<{
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
    sendMessage(id: string, dto: SendMessageDto, user: any): Promise<{
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
    updateMessage(id: string, dto: UpdateMessageDto, user: any): Promise<{
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
    getConversationMembers(id: string, user: any): Promise<{
        id: string;
        userId: string;
        role: string;
        joinedAt: Date;
        registrationNumber: string;
        name: string;
        avatarUrl: string | null;
        isOrganizer: boolean;
    }[]>;
    kickMember(conversationId: string, targetUserId: string, user: any): Promise<{
        message: string;
    }>;
    pinMessage(conversationId: string, messageId: string, user: any): Promise<{
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
    unpinMessage(conversationId: string, user: any): Promise<{
        message: string;
    }>;
    moderateDeleteMessage(conversationId: string, messageId: string, user: any): Promise<{
        message: string;
    }>;
    syncAllEvents(): Promise<{
        message: string;
    }>;
}
