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
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        profile: {
                                            select: {
                                                firstName: true,
                                                lastName: true,
                                                avatarUrl: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            where: { isDeleted: false },
                            include: {
                                sender: {
                                    select: {
                                        id: true,
                                        profile: { select: { firstName: true, lastName: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { conversation: { updatedAt: 'desc' } },
        });
        return Promise.all(memberships.map(async (m) => {
            const pinned = await this.getPinnedMessage(m.conversationId);
            return {
                ...m.conversation,
                currentUserRole: m.role,
                lastReadAt: m.lastReadAt,
                lastMessage: m.conversation.messages[0] || null,
                unreadCount: 0,
                membersCount: m.conversation.members.length,
                pinnedMessage: pinned,
            };
        }));
    }
    async createConversation(dto, creatorId) {
        const memberIds = Array.from(new Set([creatorId, ...(dto.memberIds ?? [])]));
        if (dto.type === create_conversation_dto_1.ConversationType.DIRECT) {
            if (memberIds.length !== 2) {
                throw new common_1.BadRequestException('DIRECT conversation requires exactly 2 members');
            }
            const otherId = memberIds.find((id) => id !== creatorId);
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
                    create: memberIds.map((uid) => ({
                        userId: uid,
                        role: uid === creatorId ? 'ADMIN' : 'MEMBER',
                    })),
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: {
                                    select: { firstName: true, lastName: true, avatarUrl: true },
                                },
                            },
                        },
                    },
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
                        user: {
                            select: {
                                id: true,
                                email: true,
                                registrationNumber: true,
                                profile: {
                                    select: { firstName: true, lastName: true, avatarUrl: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        const member = await this.assertMember(id, userId);
        const pinned = await this.getPinnedMessage(id);
        return {
            ...conv,
            currentUserRole: member.role,
            membersCount: conv.members.length,
            pinnedMessage: pinned,
        };
    }
    async getMessages(conversationId, userId, query) {
        await this.assertMember(conversationId, userId);
        const limit = Math.min(query.limit ?? 30, 100);
        const cursorCondition = query.before
            ? {
                createdAt: {
                    lt: (await this.prisma.message.findUnique({
                        where: { id: query.before },
                        select: { createdAt: true },
                    }))?.createdAt,
                },
            }
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
                sender: {
                    select: {
                        id: true,
                        profile: {
                            select: { firstName: true, lastName: true, avatarUrl: true },
                        },
                    },
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        sender: {
                            select: { id: true, profile: { select: { firstName: true } } },
                        },
                    },
                },
                attachments: true,
                reactions: {
                    include: {
                        user: {
                            select: { id: true, profile: { select: { firstName: true } } },
                        },
                    },
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
                    ? {
                        create: dto.attachments.map((a) => ({
                            fileUrl: a.fileUrl,
                            fileType: a.fileType,
                            fileSize: a.fileSize,
                        })),
                    }
                    : undefined,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        profile: {
                            select: { firstName: true, lastName: true, avatarUrl: true },
                        },
                    },
                },
                replyTo: { select: { id: true, content: true, senderId: true } },
                attachments: true,
                reactions: true,
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        this.eventEmitter.emit('chat.message.new', { conversationId, message });
        return message;
    }
    async updateMessage(messageId, userId, dto) {
        const msg = await this.assertMessageOwner(messageId, userId);
        const updated = await this.prisma.message.update({
            where: { id: messageId },
            data: { content: dto.content },
        });
        this.eventEmitter.emit('chat.message.updated', {
            conversationId: msg.conversationId,
            message: updated,
        });
        return updated;
    }
    async deleteMessage(messageId, userId) {
        const msg = await this.assertMessageOwner(messageId, userId);
        await this.prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true, content: null },
        });
        this.eventEmitter.emit('chat.message.deleted', {
            conversationId: msg.conversationId,
            messageId,
        });
        return { message: 'Message deleted' };
    }
    async addReaction(messageId, userId, emoji) {
        const msg = await this.prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!msg || msg.isDeleted)
            throw new common_1.NotFoundException('Message not found');
        await this.assertMember(msg.conversationId, userId);
        try {
            const reaction = await this.prisma.messageReaction.create({
                data: { messageId, userId, emoji },
                include: {
                    user: {
                        select: { id: true, profile: { select: { firstName: true } } },
                    },
                },
            });
            this.eventEmitter.emit('chat.reaction.added', {
                conversationId: msg.conversationId,
                messageId,
                reaction,
            });
            return reaction;
        }
        catch (e) {
            if (e.code === 'P2002')
                throw new common_1.ConflictException('You already reacted with this emoji');
            throw e;
        }
    }
    async removeReaction(messageId, userId, emoji) {
        const msg = await this.prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!msg)
            throw new common_1.NotFoundException('Message not found');
        const reaction = await this.prisma.messageReaction.findFirst({
            where: { messageId, userId, emoji },
        });
        if (!reaction)
            throw new common_1.NotFoundException('Reaction not found');
        await this.prisma.messageReaction.delete({ where: { id: reaction.id } });
        this.eventEmitter.emit('chat.reaction.removed', {
            conversationId: msg.conversationId,
            messageId,
            userId,
            emoji,
        });
        return { message: 'Reaction removed' };
    }
    async markAsRead(conversationId, userId) {
        await this.assertMember(conversationId, userId);
        await this.prisma.conversationMember.update({
            where: { conversationId_userId: { conversationId, userId } },
            data: { lastReadAt: new Date() },
        });
        this.eventEmitter.emit('chat.read', {
            conversationId,
            userId,
            readAt: new Date(),
        });
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
        const msg = await this.prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!msg || msg.isDeleted)
            throw new common_1.NotFoundException('Message not found');
        if (msg.senderId !== userId)
            throw new common_1.ForbiddenException('You can only edit/delete your own messages');
        return msg;
    }
    async getConversationMembers(conversationId, userId) {
        await this.assertMember(conversationId, userId);
        const members = await this.prisma.conversationMember.findMany({
            where: { conversationId },
            include: {
                user: {
                    select: {
                        id: true,
                        registrationNumber: true,
                        email: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
        });
        return members.map((m) => {
            const name = `${m.user.profile?.firstName || ''} ${m.user.profile?.lastName || ''}`.trim() ||
                m.user.registrationNumber ||
                'Member';
            return {
                id: m.userId,
                userId: m.userId,
                role: m.role,
                joinedAt: m.joinedAt,
                registrationNumber: m.user.registrationNumber,
                name,
                avatarUrl: m.user.profile?.avatarUrl || null,
                isOrganizer: m.role === 'ADMIN',
            };
        });
    }
    async kickMember(conversationId, targetUserId, actorId, hasGlobalPerm = false) {
        const actorMember = await this.prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId: actorId } },
        });
        if (!hasGlobalPerm && actorMember?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only conversation admins or organizers can remove members');
        }
        await this.prisma.conversationMember.deleteMany({
            where: { conversationId, userId: targetUserId },
        });
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (conv?.eventId) {
            await this.prisma.eventRegistration.updateMany({
                where: { eventId: conv.eventId, userId: targetUserId },
                data: { status: 'CANCELLED' },
            });
        }
        this.eventEmitter.emit('chat.member.removed', {
            conversationId,
            userId: targetUserId,
            reason: 'Removed by organizer',
        });
        return { message: 'Member removed from event and chat group successfully' };
    }
    async pinMessage(conversationId, messageId, actorId, hasGlobalPerm = false) {
        const actorMember = await this.prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId: actorId } },
        });
        if (!hasGlobalPerm && actorMember?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only conversation admins or organizers can pin messages');
        }
        const message = await this.prisma.message.findFirst({
            where: { id: messageId, conversationId, isDeleted: false },
            include: {
                sender: {
                    select: {
                        id: true,
                        profile: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });
        if (!message)
            throw new common_1.NotFoundException('Message not found');
        await this.prisma.appSetting.upsert({
            where: { key: `conv_pin:${conversationId}` },
            update: { value: messageId },
            create: { key: `conv_pin:${conversationId}`, value: messageId },
        });
        this.eventEmitter.emit('chat.message.pinned', {
            conversationId,
            message,
        });
        return { message: 'Message pinned successfully', pinnedMessage: message };
    }
    async unpinMessage(conversationId, actorId, hasGlobalPerm = false) {
        const actorMember = await this.prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId: actorId } },
        });
        if (!hasGlobalPerm && actorMember?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only conversation admins or organizers can unpin messages');
        }
        await this.prisma.appSetting.deleteMany({
            where: { key: `conv_pin:${conversationId}` },
        });
        this.eventEmitter.emit('chat.message.unpinned', {
            conversationId,
            messageId: '',
        });
        return { message: 'Message unpinned successfully' };
    }
    async getPinnedMessage(conversationId) {
        const setting = await this.prisma.appSetting.findUnique({
            where: { key: `conv_pin:${conversationId}` },
        });
        if (!setting?.value)
            return null;
        return this.prisma.message.findFirst({
            where: { id: setting.value, conversationId, isDeleted: false },
            include: {
                sender: {
                    select: {
                        id: true,
                        profile: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });
    }
    async moderateDeleteMessage(conversationId, messageId, actorId, hasGlobalPerm = false) {
        const actorMember = await this.prisma.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId: actorId } },
        });
        if (!hasGlobalPerm && actorMember?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only conversation admins or organizers can delete messages from others');
        }
        await this.prisma.message.update({
            where: { id: messageId },
            data: {
                isDeleted: true,
                content: 'This message was removed by an organizer',
            },
        });
        this.eventEmitter.emit('chat.message.deleted', {
            conversationId,
            messageId,
        });
        return { message: 'Message removed by organizer' };
    }
    async ensureEventConversation(eventId, eventName, creatorId) {
        let conv = await this.prisma.conversation.findUnique({
            where: { eventId },
        });
        if (!conv) {
            conv = await this.prisma.conversation.create({
                data: {
                    type: 'EVENT',
                    name: eventName,
                    eventId,
                    members: creatorId
                        ? { create: { userId: creatorId, role: 'ADMIN' } }
                        : undefined,
                },
            });
        }
        if (creatorId) {
            await this.prisma.conversationMember.upsert({
                where: {
                    conversationId_userId: {
                        conversationId: conv.id,
                        userId: creatorId,
                    },
                },
                update: { role: 'ADMIN' },
                create: {
                    conversationId: conv.id,
                    userId: creatorId,
                    role: 'ADMIN',
                },
            });
        }
        return conv;
    }
    async syncEventOrganizers(eventId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { organizers: true },
        });
        if (!event)
            return;
        const conv = await this.ensureEventConversation(eventId, event.name);
        for (const org of event.organizers) {
            await this.prisma.conversationMember.upsert({
                where: {
                    conversationId_userId: {
                        conversationId: conv.id,
                        userId: org.userId,
                    },
                },
                update: { role: 'ADMIN' },
                create: {
                    conversationId: conv.id,
                    userId: org.userId,
                    role: 'ADMIN',
                },
            });
        }
    }
    async addMemberToEventChat(eventId, userId, role = 'MEMBER') {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event)
            return;
        const conv = await this.ensureEventConversation(eventId, event.name);
        return this.prisma.conversationMember.upsert({
            where: {
                conversationId_userId: {
                    conversationId: conv.id,
                    userId,
                },
            },
            update: role === 'ADMIN' ? { role: 'ADMIN' } : {},
            create: {
                conversationId: conv.id,
                userId,
                role,
            },
        });
    }
    async removeMemberFromEventChat(eventId, userId) {
        const conv = await this.prisma.conversation.findUnique({
            where: { eventId },
        });
        if (!conv)
            return;
        await this.prisma.conversationMember.deleteMany({
            where: { conversationId: conv.id, userId },
        });
    }
    async syncAllEvents() {
        const events = await this.prisma.event.findMany({
            include: { organizers: true, registrations: true },
        });
        let count = 0;
        for (const ev of events) {
            const conv = await this.ensureEventConversation(ev.id, ev.name);
            for (const org of ev.organizers) {
                await this.prisma.conversationMember.upsert({
                    where: {
                        conversationId_userId: {
                            conversationId: conv.id,
                            userId: org.userId,
                        },
                    },
                    update: { role: 'ADMIN' },
                    create: {
                        conversationId: conv.id,
                        userId: org.userId,
                        role: 'ADMIN',
                    },
                });
            }
            for (const reg of ev.registrations) {
                if (reg.status !== 'CANCELLED') {
                    await this.prisma.conversationMember.upsert({
                        where: {
                            conversationId_userId: {
                                conversationId: conv.id,
                                userId: reg.userId,
                            },
                        },
                        update: {},
                        create: {
                            conversationId: conv.id,
                            userId: reg.userId,
                            role: 'MEMBER',
                        },
                    });
                }
            }
            count++;
        }
        return {
            message: `Synchronized ${count} event chat groups with organizers as ADMINs!`,
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], ChatService);
//# sourceMappingURL=chat.service.js.map