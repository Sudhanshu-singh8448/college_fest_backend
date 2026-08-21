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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendance_service_1 = require("./attendance.service");
const check_in_dto_1 = require("./dto/check-in.dto");
const verify_qr_dto_1 = require("./dto/verify-qr.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async verifyQr(dto) {
        return this.attendanceService.verifyQr(dto.qrToken);
    }
    async checkIn(dto, user) {
        const hasGlobalPerm = user.permissions.includes('attendance:manage_all');
        return this.attendanceService.checkIn(dto.eventId, dto.qrToken, user.id, hasGlobalPerm);
    }
    async getEventAttendance(eventId, user) {
        const hasGlobalPerm = user.permissions.includes('attendance:manage_all');
        return this.attendanceService.getEventAttendance(eventId, user.id, hasGlobalPerm);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('attendance/verify'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('ticket:scan'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify a QR token without checking in' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_qr_dto_1.VerifyQrDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "verifyQr", null);
__decorate([
    (0, common_1.Post)('attendance/check-in'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('attendance:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Check-in a user via QR to an event' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_in_dto_1.CheckInDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Get)('events/:id/attendance'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('attendance:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance list for an event' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getEventAttendance", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('Attendance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map