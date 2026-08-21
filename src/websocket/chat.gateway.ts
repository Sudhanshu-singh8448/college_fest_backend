import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger, UseFilters } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChatService } from '../modules/chat/chat.service';
import { PrismaService } from '../database/prisma.service';
import { SendMessageDto } from '../modules/chat/dto/send-message.dto';

/**
 * Socket.IO Gateway for real-time chat & presence.
 *
 * Authentication flow:
 *   1. Client connects and immediately emits `authenticate` with their JWT.
 *   2. Gateway verifies the JWT, loads user permissions, and joins the socket
 *      to rooms for every conversation the user is a member of.
 *   3. Any subsequent server-side event (new message, typing, etc.) is emitted
 *      to the relevant room so all connected members receive it.
 *
 * Room naming convention:
 *   - `conv:{conversationId}` — all members of a conversation
 *   - `user:{userId}`         — for user-specific notifications
 */
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // userId → Set of socketIds (for multi-tab presence)
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('ChatGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId as string | undefined;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          // Broadcast presence: OFFLINE
          this.broadcastPresence(userId, 'OFFLINE');
        }
      }
    }
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  // ─────────────────────────────────────────────────────
  // CLIENT → SERVER EVENTS
  // ─────────────────────────────────────────────────────

  /**
   * Client emits: authenticate { token }
   * Server verifies JWT, joins all conversation rooms, broadcasts ONLINE presence.
   */
  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token: string },
  ) {
    try {
      const payload = this.jwtService.verify(data.token, {
        algorithms: ['RS256'],
        publicKey: this.configService.get<string>('jwt.publicKey'),
      });

      const userId = payload.sub as string;
      (client as any).userId = userId;

      // Track socket
      if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
      this.userSockets.get(userId)!.add(client.id);

      // Join user-specific room for direct notifications
      client.join(`user:${userId}`);

      // Join all conversation rooms
      const memberships = await this.prisma.conversationMember.findMany({
        where: { userId },
        select: { conversationId: true },
      });
      for (const m of memberships) {
        client.join(`conv:${m.conversationId}`);
      }

      // Broadcast presence: ONLINE
      this.broadcastPresence(userId, 'ONLINE');

      client.emit('authenticated', { userId, joinedRooms: memberships.length + 1 });
      this.logger.log(`User ${userId} authenticated on socket ${client.id}`);
    } catch {
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  /**
   * Client emits: message:send { conversationId, content, type?, replyToId?, attachments? }
   * Server stores message via ChatService, broadcasts to conversation room.
   */
  @SubscribeMessage('message:send')
  async handleMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string } & SendMessageDto,
  ) {
    const userId = (client as any).userId as string | undefined;
    if (!userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      const message = await this.chatService.sendMessage(data.conversationId, userId, {
        content: data.content,
        type: data.type,
        replyToId: data.replyToId,
        attachments: data.attachments,
      });

      // Broadcast to entire conversation room (including sender for confirmation)
      this.server.to(`conv:${data.conversationId}`).emit('message:new', { message });
    } catch (e: any) {
      client.emit('error', { message: e.message });
    }
  }

  /**
   * Client emits: message:typing { conversationId, isTyping }
   * Server broadcasts typing indicator to other members.
   */
  @SubscribeMessage('message:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = (client as any).userId as string | undefined;
    if (!userId) return;

    // Broadcast to room EXCEPT the sender
    client.to(`conv:${data.conversationId}`).emit('message:typing', {
      conversationId: data.conversationId,
      userId,
      isTyping: data.isTyping,
    });
  }

  /**
   * Client emits: message:read { conversationId, messageId }
   * Server updates lastReadAt and broadcasts read receipt to room.
   */
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    const userId = (client as any).userId as string | undefined;
    if (!userId) return;

    await this.chatService.markAsRead(data.conversationId, userId);
    // Broadcast read event to the room (so other clients can update read indicators)
    this.server.to(`conv:${data.conversationId}`).emit('message:read', {
      conversationId: data.conversationId,
      userId,
      messageId: data.messageId,
    });
  }

  /**
   * Client emits: presence:update { status }
   * Server broadcasts to all conversations the user is a member of.
   */
  @SubscribeMessage('presence:update')
  async handlePresenceUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { status: string },
  ) {
    const userId = (client as any).userId as string | undefined;
    if (!userId) return;
    this.broadcastPresence(userId, data.status);
  }

  // ─────────────────────────────────────────────────────
  // SERVER-SIDE EVENT LISTENERS (from ChatService via EventEmitter2)
  // ─────────────────────────────────────────────────────

  /**
   * Fired by ChatService.sendMessage() when a REST call creates a message.
   * Ensures WebSocket delivery even when client sends via REST.
   */
  @OnEvent('chat.message.new')
  handleChatMessageNew(payload: { conversationId: string; message: any }) {
    this.server.to(`conv:${payload.conversationId}`).emit('message:new', { message: payload.message });
  }

  @OnEvent('chat.message.updated')
  handleChatMessageUpdated(payload: { conversationId: string; message: any }) {
    this.server.to(`conv:${payload.conversationId}`).emit('message:updated', { message: payload.message });
  }

  @OnEvent('chat.message.deleted')
  handleChatMessageDeleted(payload: { conversationId: string; messageId: string }) {
    this.server.to(`conv:${payload.conversationId}`).emit('message:deleted', { messageId: payload.messageId });
  }

  @OnEvent('chat.reaction.added')
  handleReactionAdded(payload: { conversationId: string; messageId: string; reaction: any }) {
    this.server.to(`conv:${payload.conversationId}`).emit('message:reaction_added', {
      messageId: payload.messageId,
      reaction: payload.reaction,
    });
  }

  @OnEvent('chat.reaction.removed')
  handleReactionRemoved(payload: { conversationId: string; messageId: string; userId: string; emoji: string }) {
    this.server.to(`conv:${payload.conversationId}`).emit('message:reaction_removed', {
      messageId: payload.messageId,
      userId: payload.userId,
      emoji: payload.emoji,
    });
  }

  @OnEvent('chat.read')
  handleChatRead(payload: { conversationId: string; userId: string; readAt: Date }) {
    this.server.to(`conv:${payload.conversationId}`).emit('message:read', payload);
  }

  // ─────────────────────────────────────────────────────
  // INTERNAL HELPERS
  // ─────────────────────────────────────────────────────

  /**
   * Broadcast a presence change event to all rooms the user belongs to.
   */
  private async broadcastPresence(userId: string, status: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true },
    });

    const payload = { userId, status, lastSeen: new Date() };

    for (const m of memberships) {
      this.server.to(`conv:${m.conversationId}`).emit('presence:changed', payload);
    }
  }

  /**
   * Helper to join a socket to a new conversation room (called externally when user is added to a group).
   */
  joinConversationRoom(userId: string, conversationId: string) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    for (const sid of sockets) {
      const socket = this.server.sockets.sockets.get(sid);
      socket?.join(`conv:${conversationId}`);
    }
  }
}
