import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateConversationDto, ConversationType } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─────────────────────────────────────────────────────
  // CONVERSATIONS
  // ─────────────────────────────────────────────────────

  /**
   * GET /conversations
   * Returns all conversations the current user is a member of.
   */
  async getMyConversations(userId: string) {
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
      unreadCount: 0, // Computed separately via lastReadAt comparison if needed
    }));
  }

  /**
   * POST /conversations
   * Creates a DIRECT or GROUP conversation.
   */
  async createConversation(dto: CreateConversationDto, creatorId: string) {
    const memberIds = Array.from(new Set([creatorId, ...(dto.memberIds ?? [])]));

    if (dto.type === ConversationType.DIRECT) {
      if (memberIds.length !== 2) {
        throw new BadRequestException('DIRECT conversation requires exactly 2 members');
      }
      const otherId = memberIds.find(id => id !== creatorId)!;

      // Prevent duplicate direct conversations
      const existing = await this.prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            { members: { some: { userId: creatorId } } },
            { members: { some: { userId: otherId } } },
          ],
        },
      });
      if (existing) return existing;
    }

    if (dto.type === ConversationType.GROUP && !dto.name) {
      throw new BadRequestException('Group conversations require a name');
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

  /**
   * GET /conversations/:id
   * Returns full details of a single conversation, with membership guard.
   */
  async getConversationById(id: string, userId: string) {
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

    if (!conv) throw new NotFoundException('Conversation not found');
    await this.assertMember(id, userId);
    return conv;
  }

  // ─────────────────────────────────────────────────────
  // MESSAGES
  // ─────────────────────────────────────────────────────

  /**
   * GET /conversations/:id/messages
   * Cursor-based pagination — newest first, starting before `cursor`.
   */
  async getMessages(conversationId: string, userId: string, query: MessageQueryDto) {
    await this.assertMember(conversationId, userId);

    const limit = Math.min(query.limit ?? 30, 100);

    // Build cursor condition
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

  /**
   * POST /conversations/:id/messages
   * REST fallback for sending a message (same logic as WS handler).
   */
  async sendMessage(conversationId: string, senderId: string, dto: SendMessageDto) {
    await this.assertMember(conversationId, senderId);

    // Validate replyToId exists in this conversation
    if (dto.replyToId) {
      const replied = await this.prisma.message.findFirst({
        where: { id: dto.replyToId, conversationId },
      });
      if (!replied) throw new NotFoundException('Replied-to message not found in this conversation');
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

    // Update conversation updatedAt
    await this.prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

    // Emit internally (Gateway will forward to socket rooms)
    this.eventEmitter.emit('chat.message.new', { conversationId, message });

    return message;
  }

  /**
   * PATCH /messages/:id
   * Edit own message.
   */
  async updateMessage(messageId: string, userId: string, dto: UpdateMessageDto) {
    const msg = await this.assertMessageOwner(messageId, userId);

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { content: dto.content },
    });

    this.eventEmitter.emit('chat.message.updated', { conversationId: msg.conversationId, message: updated });
    return updated;
  }

  /**
   * DELETE /messages/:id
   * Soft-delete own message.
   */
  async deleteMessage(messageId: string, userId: string) {
    const msg = await this.assertMessageOwner(messageId, userId);

    await this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true, content: null },
    });

    this.eventEmitter.emit('chat.message.deleted', { conversationId: msg.conversationId, messageId });
    return { message: 'Message deleted' };
  }

  // ─────────────────────────────────────────────────────
  // REACTIONS
  // ─────────────────────────────────────────────────────

  /**
   * POST /messages/:id/reactions
   * Add emoji reaction to a message.
   */
  async addReaction(messageId: string, userId: string, emoji: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg || msg.isDeleted) throw new NotFoundException('Message not found');
    await this.assertMember(msg.conversationId, userId);

    // Upsert — if same emoji from same user already exists, update (no-op functionally)
    try {
      const reaction = await this.prisma.messageReaction.create({
        data: { messageId, userId, emoji },
        include: { user: { select: { id: true, profile: { select: { firstName: true } } } } },
      });
      this.eventEmitter.emit('chat.reaction.added', { conversationId: msg.conversationId, messageId, reaction });
      return reaction;
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('You already reacted with this emoji');
      throw e;
    }
  }

  /**
   * DELETE /messages/:id/reactions/:emoji
   * Remove own emoji reaction.
   */
  async removeReaction(messageId: string, userId: string, emoji: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');

    const reaction = await this.prisma.messageReaction.findFirst({
      where: { messageId, userId, emoji },
    });
    if (!reaction) throw new NotFoundException('Reaction not found');

    await this.prisma.messageReaction.delete({ where: { id: reaction.id } });
    this.eventEmitter.emit('chat.reaction.removed', { conversationId: msg.conversationId, messageId, userId, emoji });
    return { message: 'Reaction removed' };
  }

  // ─────────────────────────────────────────────────────
  // READ RECEIPTS
  // ─────────────────────────────────────────────────────

  /**
   * POST /conversations/:id/read
   * Marks the conversation as read up to the current timestamp for the user.
   */
  async markAsRead(conversationId: string, userId: string) {
    await this.assertMember(conversationId, userId);

    await this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });

    this.eventEmitter.emit('chat.read', { conversationId, userId, readAt: new Date() });
    return { message: 'Marked as read' };
  }

  // ─────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────

  private async assertMember(conversationId: string, userId: string) {
    const membership = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!membership) throw new ForbiddenException('You are not a member of this conversation');
    return membership;
  }

  private async assertMessageOwner(messageId: string, userId: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg || msg.isDeleted) throw new NotFoundException('Message not found');
    if (msg.senderId !== userId) throw new ForbiddenException('You can only edit/delete your own messages');
    return msg;
  }
}
