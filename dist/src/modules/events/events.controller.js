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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const update_event_status_dto_1 = require("./dto/update-event-status.dto");
const add_organizer_dto_1 = require("./dto/add-organizer.dto");
const event_query_dto_1 = require("./dto/event-query.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async findAll(query) {
        return this.eventsService.findAll(query);
    }
    async findOne(id) {
        return this.eventsService.findOne(id);
    }
    async create(dto, user) {
        return this.eventsService.create(dto, user.id);
    }
    async update(id, dto, user) {
        const hasGlobalPerm = user.permissions.includes('event:manage_all');
        return this.eventsService.update(id, dto, user.id, hasGlobalPerm);
    }
    async remove(id) {
        return this.eventsService.remove(id);
    }
    async updateStatus(id, dto, user) {
        const hasGlobalPerm = user.permissions.includes('event:manage_all');
        return this.eventsService.updateStatus(id, dto.status, user.id, hasGlobalPerm);
    }
    async getOrganizers(id, user) {
        const hasGlobalPerm = user.permissions.includes('event:manage_all');
        return this.eventsService.getOrganizers(id, user.id, hasGlobalPerm);
    }
    async addOrganizer(id, dto, user) {
        const hasGlobalPerm = user.permissions.includes('event:manage_all');
        return this.eventsService.addOrganizer(id, dto.userId, dto.role, user.id, hasGlobalPerm);
    }
    async removeOrganizer(id, targetUserId, user) {
        const hasGlobalPerm = user.permissions.includes('event:manage_all');
        return this.eventsService.removeOrganizer(id, targetUserId, user.id, hasGlobalPerm);
    }
    async getStats(id, user) {
        const hasGlobalPerm = user.permissions.includes('event:manage_all');
        return this.eventsService.getStats(id, user.id, hasGlobalPerm);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List events with filters and pagination' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_query_dto_1.EventQueryDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('event:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an event (requires event:create)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('event:edit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update an event (requires event:edit and organizer role unless global admin)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('event:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete an event (requires event:delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('event:edit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update event status (requires event:edit and organizer role unless global admin)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_status_dto_1.UpdateEventStatusDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(':id/organizers'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('event:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event organizers' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getOrganizers", null);
__decorate([
    (0, common_1.Post)(':id/organizers'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('event:edit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add an organizer (requires event:edit and PRIMARY role unless global admin)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_organizer_dto_1.AddOrganizerDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "addOrganizer", null);
__decorate([
    (0, common_1.Delete)(':id/organizers/:userId'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('event:edit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove an organizer (requires event:edit and PRIMARY role unless global admin)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "removeOrganizer", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('event:edit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get event statistics (requires event:edit and organizer role unless global admin)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getStats", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/events'),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map