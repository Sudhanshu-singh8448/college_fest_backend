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
exports.RegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const registrations_service_1 = require("./registrations.service");
const create_registration_dto_1 = require("./dto/create-registration.dto");
const update_registration_status_dto_1 = require("./dto/update-registration-status.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let RegistrationsController = class RegistrationsController {
    registrationsService;
    constructor(registrationsService) {
        this.registrationsService = registrationsService;
    }
    async register(eventId, dto, user) {
        return this.registrationsService.register(eventId, user.id, dto);
    }
    async getEventRegistrations(eventId, user) {
        const hasGlobalPerm = user.permissions.includes('registration:manage_all');
        return this.registrationsService.getEventRegistrations(eventId, user.id, hasGlobalPerm);
    }
    async getMyRegistrations(user) {
        return this.registrationsService.getMyRegistrations(user.id);
    }
    async getRegistrationById(id, user) {
        const hasGlobalPerm = user.permissions.includes('registration:manage_all');
        return this.registrationsService.getRegistrationById(id, user.id, hasGlobalPerm);
    }
    async updateStatus(id, dto, user) {
        const hasGlobalPerm = user.permissions.includes('registration:manage_all');
        return this.registrationsService.updateStatus(id, dto, user.id, hasGlobalPerm);
    }
    async approveAll(eventId, user) {
        const hasGlobalPerm = user.permissions.includes('registration:manage_all');
        return this.registrationsService.approveAll(eventId, user.id, hasGlobalPerm);
    }
    async remove(id, user) {
        return this.registrationsService.remove(id, user.id);
    }
    async exportRegistrations(eventId, user) {
        const hasGlobalPerm = user.permissions.includes('registration:manage_all');
        return this.registrationsService.exportRegistrations(eventId, user.id, hasGlobalPerm);
    }
};
exports.RegistrationsController = RegistrationsController;
__decorate([
    (0, common_1.Post)('events/:id/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register for an event' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_registration_dto_1.CreateRegistrationDto, Object]),
    __metadata("design:returntype", Promise)
], RegistrationsController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('events/:id/registrations'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('registration:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all registrations for an event (organizers only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegistrationsController.prototype, "getEventRegistrations", null);
__decorate([
    (0, common_1.Get)('registrations/my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my registrations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RegistrationsController.prototype, "getMyRegistrations", null);
__decorate([
    (0, common_1.Get)('registrations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get registration by ID (owner or organizer)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegistrationsController.prototype, "getRegistrationById", null);
__decorate([
    (0, common_1.Patch)('registrations/:id/status'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('registration:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Update registration status (organizers only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_registration_status_dto_1.UpdateRegistrationStatusDto, Object]),
    __metadata("design:returntype", Promise)
], RegistrationsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('events/:id/registrations/approve-all'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('registration:approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk approve pending registrations (organizers only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegistrationsController.prototype, "approveAll", null);
__decorate([
    (0, common_1.Delete)('registrations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete (cancel) own registration' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegistrationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('events/:id/registrations/export'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('registration:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Export registrations (organizers only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RegistrationsController.prototype, "exportRegistrations", null);
exports.RegistrationsController = RegistrationsController = __decorate([
    (0, swagger_1.ApiTags)('Registrations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [registrations_service_1.RegistrationsService])
], RegistrationsController);
//# sourceMappingURL=registrations.controller.js.map