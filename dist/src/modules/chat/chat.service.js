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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const event_emitter_1 = require("@nestjs/event-emitter");
let ChatService = class ChatService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async getMyConversations(userId) {
        const memberships = await this.prisma.conversationMember.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        members: {
                            include: {
                                user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
                            },
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            where: { isDeleted: false },
                            include: {
                                sender: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
                            },
                        },
                    },
                },
            },
            orderBy: { conversation: { updatedAt: 'desc' } },
        });
        return memberships.map(m => ({
            ...m.conversation,
            lastReadAt: m.lastReadAt,
            lastMessage: m.conversation.messages[0] || null,
            unreadCount: 0,
        }));
    }
    async createConversation(dto, creatorId) {
        const memberIds = Array.from(new Set([creatorId, ...(dto.memberIds ?? [])]));
        if (dto.type === create_conversation_dto_1.ConversationType.DIRECT) {
            if (memberIds.length !== 2) {
                throw new common_1.BadRequestException('DIRECT conversation requires exactly 2 members');
            }
            const otherId = memberIds.find(id => id !== creatorId);
            const existing = await this.prisma.conversation.findFirst({
                where: {
                    type: 'DIRECT',
                    AND: [
                        { members: { some: { userId: creatorId } } },
                        { members: { some: { userId: otherId } } },
                    ],
                },
            });
            if (existing)
                return existing;
        }
        if (dto.type === create_conversation_dto_1.ConversationType.GROUP && !dto.name) {
            throw new common_1.BadRequestException('Group conversations require a name');
        }
        return this.prisma.conversation.create({
            data: {
                type: dto.type,
                name: dto.name,
                members: {
                    create: memberIds.map(uid => ({
                        userId: uid,
                        role: uid === creatorId ? 'ADMIN' : 'MEMBER',
                    })),
                },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } } },
                },
            },
        });
    }
    async getConversationById(id, userId) {
        const conv = await this.prisma.conversation.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: { select: { id: true, email: true, registrationNumber: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
                    },
                },
            },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        await this.assertMember(id, userId);
        return conv;
    }
    async getMessages(conversationId, userId, query) {
        await this.assertMember(conversationId, userId);
        const limit = Math.min(query.limit ?? 30, 100);
        const cursorCondition = query.before
            ? { createdAt: { lt: (await this.prisma.message.findUnique({ where: { id: query.before }, select: { createdAt: true } }))?.createdAt } }
            : {};
        const messages = await this.prisma.message.findMany({
            where: {
                conversationId,
                isDeleted: false,
                ...cursorCondition,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                sender: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
                replyTo: {
                    select: { id: true, content: true, sender: { select: { id: true, profile: { select: { firstName: true } } } } },
                },
                attachments: true,
                reactions: {
                    include: { user: { select: { id: true, profile: { select: { firstName: true } } } } },
                },
            },
        });
        const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;
        return { messages: messages.reverse(), nextCursor };
    }
    async sendMessage(conversationId, senderId, dto) {
        await this.assertMember(conversationId, senderId);
        if (dto.replyToId) {
            const replied = await this.prisma.message.findFirst({
                where: { id: dto.replyToId, conversationId },
            });
            if (!replied)
                throw new common_1.NotFoundException('Replied-to message not found in this conversation');
        }
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderId,
                content: dto.content,
                type: dto.type ?? 'TEXT',
                replyToId: dto.replyToId ?? null,
                attachments: dto.attachments
                    ? { create: dto.attachments.map(a => ({ fileUrl: a.fileUrl, fileType: a.fileType, fileSize: a.fileSize })) }
                    : undefined,
            },
            include: {
                sender: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
                replyTo: { select: { id: true, content: true, senderId: true } },
                attachments: true,
                reactions: true,
            },
        });
        await this.prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
        this.eventEmitter.emit('chat.message.new', { conversationId, message });
        return message;
    }
    async updateMessage(messageId, userId, dto) {
        const msg = await this.assertMessageOwner(messageId, userId);
        const updated = await this.prisma.message.update({
            where: { id: messageId },
            data: { content: dto.content },
        });
        this.eventEmitter.emit('chat.message.updated', { conversationId: msg.conversationId, message: updated });
        return updated;
    }
    async deleteMessage(messageId, userId) {
        const msg = await this.assertMessageOwner(messageId, userId);
        await this.prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true, content: null },
        });
        this.eventEmitter.emit('chat.message.deleted', { conversationId: msg.conversationId, messageId });
        return { message: 'Message deleted' };
    }
    async addReaction(messageId, userId, emoji) {
        const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!msg || msg.isDeleted)
            throw new common_1.NotFoundException('Message not found');
        await this.assertMember(msg.conversationId, userId);
        try {
            const reaction = await this.prisma.messageReaction.create({
                data: { messageId, userId, emoji },
                include: { user: { select: { id: true, profile: { select: { firstName: true } } } } },
            });
            this.eventEmitter.emit('chat.reaction.added', { conversationId: msg.conversationId, messageId, reaction });
            return reaction;
        }
        catch (e) {
            if (e.code === 'P2002')
                throw new common_1.ConflictException('You already reacted with this emoji');
            throw e;
        }
    }
    async removeReaction(messageId, userId, emoji) {
        const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!msg)
            throw new common_1.NotFoundException('Message not found');
        const reaction = await this.prisma.messageReaction.findFirst({
            where: { messageId, userId, emoji },
        });
        if (!reaction)
            throw new common_1.NotFoundException('Reaction not found');
        await this.prisma.messageReaction.delete({ where: { id: reaction.id } });
        this.eventEmitter.emit('chat.reaction.removed', { conversationId: msg.conversationId, messageId, userId, emoji });
        return { message: 'Reaction removed' };
    }
    async markAsRead(conversationId, userId) {
        await this.assertMember(conversationId, userId);
        await this.prisma.conversationMember.update({
            where: { conversationId_userId: { conversationId, userId } },
            data: { lastReadAt: new Date() },
        });
        this.eventEmitter.emit('chat.read', { conversationId, userId, readAt: new Date() });
        return { message: 'Marked as read' };
    }
    async assertMember(conversationId, userId) {
        const membership = await this.prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId } },
        });
        if (!membership)
            throw new common_1.ForbiddenException('You are not a member of this conversation');
        return membership;
    }
    async assertMessageOwner(messageId, userId) {
        const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!msg || msg.isDeleted)
            throw new common_1.NotFoundException('Message not found');
        if (msg.senderId !== userId)
            throw new common_1.ForbiddenException('You can only edit/delete your own messages');
        return msg;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], ChatService);
//# sourceMappingURL=chat.service.js.map