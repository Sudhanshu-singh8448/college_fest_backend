import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('api/v1')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ── Conversations ──────────────────────────────────

  @Get('conversations')
  @ApiOperation({ summary: 'List all my conversations (sorted by latest message)' })
  getMyConversations(@CurrentUser() user: any) {
    return this.chatService.getMyConversations(user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a DIRECT or GROUP conversation' })
  createConversation(@Body() dto: CreateConversationDto, @CurrentUser() user: any) {
    return this.chatService.createConversation(dto, user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get full conversation details (members-only)' })
  getConversationById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.getConversationById(id, user.id);
  }

  // ── Messages ───────────────────────────────────────

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages with cursor-based pagination (oldest first, newest page)' })
  getMessages(
    @Param('id') id: string,
    @Query() query: MessageQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.getMessages(id, user.id, query);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message via REST (WebSocket is preferred for real-time delivery)' })
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.sendMessage(id, user.id, dto);
  }

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Edit own message content' })
  updateMessage(
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.updateMessage(id, user.id, dto);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Soft-delete own message' })
  deleteMessage(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.deleteMessage(id, user.id);
  }

  // ── Reactions ──────────────────────────────────────

  @Post('messages/:id/reactions')
  @ApiOperation({ summary: 'Add emoji reaction to a message' })
  addReaction(
    @Param('id') id: string,
    @Body() dto: AddReactionDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.addReaction(id, user.id, dto.emoji);
  }

  @Delete('messages/:id/reactions/:emoji')
  @ApiOperation({ summary: 'Remove own emoji reaction from a message' })
  removeReaction(
    @Param('id') id: string,
    @Param('emoji') emoji: string,
    @CurrentUser() user: any,
  ) {
    return this.chatService.removeReaction(id, user.id, emoji);
  }

  // ── Read Receipts ──────────────────────────────────

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Mark all messages in a conversation as read up to now' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.markAsRead(id, user.id);
  }
}
