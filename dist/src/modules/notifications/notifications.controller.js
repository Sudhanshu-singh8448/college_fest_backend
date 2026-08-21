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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const notification_query_dto_1 = require("./dto/notification-query.dto");
const mark_read_dto_1 = require("./dto/mark-read.dto");
const update_preferences_dto_1 = require("./dto/update-preferences.dto");
const register_device_token_dto_1 = require("./dto/register-device-token.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    getNotifications(query, user) {
        return this.notificationsService.getNotifications(user.id, query);
    }
    markRead(dto, user) {
        return this.notificationsService.markRead(user.id, dto);
    }
    getPreferences(user) {
        return this.notificationsService.getPreferences(user.id);
    }
    updatePreferences(dto, user) {
        return this.notificationsService.updatePreferences(user.id, dto);
    }
    registerDeviceToken(dto, user) {
        return this.notificationsService.registerDeviceToken(user.id, dto);
    }
    removeDeviceToken(id, user) {
        return this.notificationsService.removeDeviceToken(id, user.id);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'List my notifications (paginated, filterable by unread)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_query_dto_1.NotificationQueryDto, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Post)('notifications/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark specific or all notifications as read' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mark_read_dto_1.MarkReadDto, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markRead", null);
__decorate([
    (0, common_1.Get)('notifications/preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Get per-type notification preferences (defaults shown for unset types)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getPreferences", null);
__decorate([
    (0, common_1.Put)('notifications/preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Update notification preferences for one or more types' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_preferences_dto_1.UpdatePreferencesDto, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Post)('device-tokens'),
    (0, swagger_1.ApiOperation)({ summary: 'Register FCM device token for push notifications' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_device_token_dto_1.RegisterDeviceTokenDto, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "registerDeviceToken", null);
__decorate([
    (0, common_1.Delete)('device-tokens/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a device token (on logout / token rotation)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "removeDeviceToken", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map