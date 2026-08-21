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
exports.TicketingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ticketing_service_1 = require("./ticketing.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TicketingController = class TicketingController {
    ticketingService;
    constructor(ticketingService) {
        this.ticketingService = ticketingService;
    }
    async getMyTickets(user) {
        return this.ticketingService.getMyTickets(user.id);
    }
    async getTicketById(id, user) {
        const hasGlobalPerm = user.permissions.includes('ticket:manage_all');
        return this.ticketingService.getTicketById(id, user.id, hasGlobalPerm);
    }
    async refreshQr(id, user) {
        const hasGlobalPerm = user.permissions.includes('ticket:manage_all');
        return this.ticketingService.refreshQr(id, user.id, hasGlobalPerm);
    }
};
exports.TicketingController = TicketingController;
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my tickets' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketingController.prototype, "getMyTickets", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket details (owner or admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketingController.prototype, "getTicketById", null);
__decorate([
    (0, common_1.Post)(':id/refresh-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate short-lived QR JWT payload' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketingController.prototype, "refreshQr", null);
exports.TicketingController = TicketingController = __decorate([
    (0, swagger_1.ApiTags)('Ticketing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/tickets'),
    __metadata("design:paramtypes", [ticketing_service_1.TicketingService])
], TicketingController);
//# sourceMappingURL=ticketing.controller.js.map