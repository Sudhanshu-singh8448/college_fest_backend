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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const audit_log_query_dto_1 = require("./dto/audit-log-query.dto");
const update_settings_dto_1 = require("./dto/update-settings.dto");
const update_reg_format_dto_1 = require("./dto/update-reg-format.dto");
const set_event_winners_dto_1 = require("./dto/set-event-winners.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
function requirePerm(user, perm) {
    if (!user.permissions?.includes(perm)) {
        throw new common_1.ForbiddenException(`Permission "${perm}" required`);
    }
}
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getDashboard(user) {
        requirePerm(user, 'analytics:view');
        return this.adminService.getDashboard();
    }
    getUserStats(user, search, page, limit) {
        requirePerm(user, 'analytics:view');
        return this.adminService.getUserStats({ search, page, limit });
    }
    getEventStats(user) {
        requirePerm(user, 'analytics:view');
        return this.adminService.getEventStats();
    }
    getFinanceStats(user) {
        requirePerm(user, 'analytics:view');
        return this.adminService.getFinanceStats();
    }
    getAuditLogs(query, user) {
        requirePerm(user, 'audit:view');
        return this.adminService.getAuditLogs(query);
    }
    getSettings(user) {
        requirePerm(user, 'settings:manage');
        return this.adminService.getSettings();
    }
    updateSettings(dto, user) {
        requirePerm(user, 'settings:manage');
        return this.adminService.updateSettings(dto);
    }
    updateRegNumberFormat(dto, user) {
        requirePerm(user, 'settings:manage');
        return this.adminService.updateRegNumberFormat(dto);
    }
    getEventWinners(id, user) {
        requirePerm(user, 'analytics:view');
        return this.adminService.getEventWinners(id);
    }
    setEventWinners(id, dto, user) {
        requirePerm(user, 'event:edit');
        return this.adminService.setEventWinners(id, user.id, dto);
    }
    exportData(type, user) {
        requirePerm(user, 'analytics:view');
        return this.adminService.exportData(type);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Super dashboard: users, events, finance, leaderboard KPIs in one call',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('users/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'User statistics + searchable user list (by name, reg number, or email)',
        description: 'Returns user list with roles/XP enriched, plus breakdowns by status and new-this-month count.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('events/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Event analytics: fill rates, attendance rates, breakdowns by category and status',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getEventStats", null);
__decorate([
    (0, common_1.Get)('finance/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Finance analytics: expense totals by status/category/event, pending approval queue',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getFinanceStats", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({
        summary: 'Search paginated audit logs (append-only, 1-year retention)',
        description: 'Filterable by actor, action, resource type, resource ID, and date range.',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_log_query_dto_1.AuditLogQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all app settings as a key-value map' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk-upsert app settings',
        description: 'Pass a key-value map. Missing keys are created; existing keys are updated.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settings_dto_1.UpdateSettingsDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Put)('reg-number-format'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update the registration number format',
        description: 'Supported placeholders: {YEAR}, {BRANCH}, {BATCH}, {SEQ:N}. Returns a live preview.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_reg_format_dto_1.UpdateRegNumberFormatDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateRegNumberFormat", null);
__decorate([
    (0, common_1.Get)('events/:id/winners'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all winners for an event, ordered by position' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getEventWinners", null);
__decorate([
    (0, common_1.Post)('events/:id/winners'),
    (0, swagger_1.ApiOperation)({
        summary: 'Set (replace) all winners for an event',
        description: 'All provided userIds must be APPROVED or CHECKED_IN participants. Replaces any existing winners.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_event_winners_dto_1.SetEventWinnersDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "setEventWinners", null);
__decorate([
    (0, common_1.Get)('export/:type'),
    (0, swagger_1.ApiOperation)({
        summary: 'Export structured data as JSON (ready for client-side CSV/Excel)',
        description: 'Supported types: **users**, **events**, **registrations**, **expenses**, **attendance**, **feedback**',
    }),
    (0, swagger_1.ApiParam)({
        name: 'type',
        enum: ['users', 'events', 'registrations', 'expenses', 'attendance', 'feedback'],
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "exportData", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin & Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map