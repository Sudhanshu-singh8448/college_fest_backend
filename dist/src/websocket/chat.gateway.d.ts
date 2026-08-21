import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../modules/chat/chat.service';
import { PrismaService } from '../database/prisma.service';
import { SendMessageDto } from '../modules/chat/dto/send-message.dto';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    private readonly chatService;
    private readonly prisma;
    server: Server;
    private readonly logger;
    private userSockets;
    constructor(jwtService: JwtService, configService: ConfigService, chatService: ChatService, prisma: PrismaService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleAuthenticate(client: Socket, data: {
        token: string;
    }): Promise<void>;
    handleMessageSend(client: Socket, data: {
        conversationId: string;
    } & SendMessageDto): Promise<boolean | undefined>;
    handleTyping(client: Socket, data: {
        conversationId: string;
        isTyping: boolean;
    }): void;
    handleMessageRead(client: Socket, data: {
        conversationId: string;
        messageId: string;
    }): Promise<void>;
    handlePresenceUpdate(client: Socket, data: {
        status: string;
    }): Promise<void>;
    handleChatMessageNew(payload: {
        conversationId: string;
        message: any;
    }): void;
    handleChatMessageUpdated(payload: {
        conversationId: string;
        message: any;
    }): void;
    handleChatMessageDeleted(payload: {
        conversationId: string;
        messageId: string;
    }): void;
    handleReactionAdded(payload: {
        conversationId: string;
        messageId: string;
        reaction: any;
    }): void;
    handleReactionRemoved(payload: {
        conversationId: string;
        messageId: string;
        userId: string;
        emoji: string;
    }): void;
    handleChatRead(payload: {
        conversationId: string;
        userId: string;
        readAt: Date;
    }): void;
    private broadcastPresence;
    joinConversationRoom(userId: string, conversationId: string): void;
}
