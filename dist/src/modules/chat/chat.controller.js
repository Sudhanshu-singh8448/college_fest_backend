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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const chat_service_1 = require("./chat.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
const update_message_dto_1 = require("./dto/update-message.dto");
const add_reaction_dto_1 = require("./dto/add-reaction.dto");
const message_query_dto_1 = require("./dto/message-query.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    getMyConversations(user) {
        return this.chatService.getMyConversations(user.id);
    }
    createConversation(dto, user) {
        return this.chatService.createConversation(dto, user.id);
    }
    getConversationById(id, user) {
        return this.chatService.getConversationById(id, user.id);
    }
    getMessages(id, query, user) {
        return this.chatService.getMessages(id, user.id, query);
    }
    sendMessage(id, dto, user) {
        return this.chatService.sendMessage(id, user.id, dto);
    }
    updateMessage(id, dto, user) {
        return this.chatService.updateMessage(id, user.id, dto);
    }
    deleteMessage(id, user) {
        return this.chatService.deleteMessage(id, user.id);
    }
    addReaction(id, dto, user) {
        return this.chatService.addReaction(id, user.id, dto.emoji);
    }
    removeReaction(id, emoji, user) {
        return this.chatService.removeReaction(id, user.id, emoji);
    }
    markAsRead(id, user) {
        return this.chatService.markAsRead(id, user.id);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'List all my conversations (sorted by latest message)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getMyConversations", null);
__decorate([
    (0, common_1.Post)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a DIRECT or GROUP conversation' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversation_dto_1.CreateConversationDto, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full conversation details (members-only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getConversationById", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get messages with cursor-based pagination (oldest first, newest page)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, message_query_dto_1.MessageQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message via REST (WebSocket is preferred for real-time delivery)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, send_message_dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Patch)('messages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Edit own message content' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_message_dto_1.UpdateMessageDto, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "updateMessage", null);
__decorate([
    (0, common_1.Delete)('messages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete own message' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Post)('messages/:id/reactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Add emoji reaction to a message' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_reaction_dto_1.AddReactionDto, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "addReaction", null);
__decorate([
    (0, common_1.Delete)('messages/:id/reactions/:emoji'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove own emoji reaction from a message' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('emoji')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "removeReaction", null);
__decorate([
    (0, common_1.Post)('conversations/:id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all messages in a conversation as read up to now' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "markAsRead", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map