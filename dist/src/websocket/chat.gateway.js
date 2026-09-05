"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const chat_service_1 = require("../modules/chat/chat.service");
const prisma_service_1 = require("../database/prisma.service");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    jwtService;
    configService;
    chatService;
    prisma;
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    userSockets = new Map();
    constructor(jwtService, configService, chatService, prisma) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.chatService = chatService;
        this.prisma = prisma;
    }
    afterInit(server) {
        this.logger.log('ChatGateway initialized');
    }
    handleConnection(client) {
        this.logger.debug(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        const userId = client.userId;
        if (userId) {
            const sockets = this.userSockets.get(userId);
            if (sockets) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                    this.broadcastPresence(userId, 'OFFLINE');
                }
            }
        }
        this.logger.debug(`Client disconnected: ${client.id}`);
    }
    async handleAuthenticate(client, data) {
        try {
            const payload = this.jwtService.verify(data.token, {
                algorithms: ['RS256'],
                publicKey: this.configService.get('jwt.publicKey'),
            });
            const userId = payload.sub;
            client.userId = userId;
            if (!this.userSockets.has(userId))
                this.userSockets.set(userId, new Set());
            this.userSockets.get(userId).add(client.id);
            client.join(`user:${userId}`);
            const memberships = await this.prisma.conversationMember.findMany({
                where: { userId },
                select: { conversationId: true },
            });
            for (const m of memberships) {
                client.join(`conv:${m.conversationId}`);
            }
            this.broadcastPresence(userId, 'ONLINE');
            client.emit('authenticated', {
                userId,
                joinedRooms: memberships.length + 1,
            });
            this.logger.log(`User ${userId} authenticated on socket ${client.id}`);
        }
        catch {
            client.emit('error', { message: 'Authentication failed' });
            client.disconnect();
        }
    }
    async handleMessageSend(client, data) {
        const userId = client.userId;
        if (!userId)
            return client.emit('error', { message: 'Not authenticated' });
        try {
            const message = await this.chatService.sendMessage(data.conversationId, userId, {
                content: data.content,
                type: data.type,
                replyToId: data.replyToId,
                attachments: data.attachments,
            });
            this.server
                .to(`conv:${data.conversationId}`)
                .emit('message:new', { message });
        }
        catch (e) {
            client.emit('error', { message: e.message });
        }
    }
    handleTyping(client, data) {
        const userId = client.userId;
        if (!userId)
            return;
        client.to(`conv:${data.conversationId}`).emit('message:typing', {
            conversationId: data.conversationId,
            userId,
            isTyping: data.isTyping,
        });
    }
    async handleMessageRead(client, data) {
        const userId = client.userId;
        if (!userId)
            return;
        await this.chatService.markAsRead(data.conversationId, userId);
        this.server.to(`conv:${data.conversationId}`).emit('message:read', {
            conversationId: data.conversationId,
            userId,
            messageId: data.messageId,
        });
    }
    async handlePresenceUpdate(client, data) {
        const userId = client.userId;
        if (!userId)
            return;
        this.broadcastPresence(userId, data.status);
    }
    handleChatMessageNew(payload) {
        this.server
            .to(`conv:${payload.conversationId}`)
            .emit('message:new', { message: payload.message });
    }
    handleChatMessageUpdated(payload) {
        this.server
            .to(`conv:${payload.conversationId}`)
            .emit('message:updated', { message: payload.message });
    }
    handleChatMessageDeleted(payload) {
        this.server
            .to(`conv:${payload.conversationId}`)
            .emit('message:deleted', { messageId: payload.messageId });
    }
    handleReactionAdded(payload) {
        this.server
            .to(`conv:${payload.conversationId}`)
            .emit('message:reaction_added', {
            messageId: payload.messageId,
            reaction: payload.reaction,
        });
    }
    handleReactionRemoved(payload) {
        this.server
            .to(`conv:${payload.conversationId}`)
            .emit('message:reaction_removed', {
            messageId: payload.messageId,
            userId: payload.userId,
            emoji: payload.emoji,
        });
    }
    handleChatRead(payload) {
        this.server
            .to(`conv:${payload.conversationId}`)
            .emit('message:read', payload);
    }
    async broadcastPresence(userId, status) {
        const memberships = await this.prisma.conversationMember.findMany({
            where: { userId },
            select: { conversationId: true },
        });
        const payload = { userId, status, lastSeen: new Date() };
        for (const m of memberships) {
            this.server
                .to(`conv:${m.conversationId}`)
                .emit('presence:changed', payload);
        }
    }
    joinConversationRoom(userId, conversationId) {
        const sockets = this.userSockets.get(userId);
        if (!sockets)
            return;
        for (const sid of sockets) {
            const socket = this.server.sockets.sockets.get(sid);
            socket?.join(`conv:${conversationId}`);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('authenticate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleAuthenticate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessageSend", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessageRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('presence:update'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handlePresenceUpdate", null);
__decorate([
    (0, event_emitter_1.OnEvent)('chat.message.new'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleChatMessageNew", null);
__decorate([
    (0, event_emitter_1.OnEvent)('chat.message.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleChatMessageUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('chat.message.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleChatMessageDeleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('chat.reaction.added'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleReactionAdded", null);
__decorate([
    (0, event_emitter_1.OnEvent)('chat.reaction.removed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleReactionRemoved", null);
__decorate([
    (0, event_emitter_1.OnEvent)('chat.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleChatRead", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*', credentials: true },
        namespace: '/ws',
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        chat_service_1.ChatService,
        prisma_service_1.PrismaService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map