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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const update_user_status_dto_1 = require("./dto/update-user-status.dto");
const assign_role_dto_1 = require("./dto/assign-role.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getMe(user) {
        return this.usersService.getMe(user.id);
    }
    async updateMyProfile(user, dto) {
        return this.usersService.updateMyProfile(user.id, dto);
    }
    async deleteAccount(user) {
        return this.usersService.softDeleteUser(user.id);
    }
    async searchUsers(query, pagination) {
        return this.usersService.searchUsers(query || '', pagination);
    }
    async getUserById(id) {
        return this.usersService.getUserById(id);
    }
    async updateUserStatus(id, dto) {
        return this.usersService.updateUserStatus(id, dto.status);
    }
    async getUserRoles(id) {
        return this.usersService.getUserRoles(id);
    }
    async assignRole(id, dto) {
        return this.usersService.assignRole(id, dto.roleName);
    }
    async removeRole(id, roleId) {
        return this.usersService.removeRole(id, roleId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile + gamification stats' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update own profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate own account (soft delete)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('user:list'),
    (0, swagger_1.ApiOperation)({ summary: 'List/search users (requires user:list permission)' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('user:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID (requires user:view permission)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('user:ban'),
    (0, swagger_1.ApiOperation)({ summary: 'Ban/suspend/activate a user (requires user:ban permission)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_status_dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Get)(':id/roles'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('role:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user roles (requires role:manage permission)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserRoles", null);
__decorate([
    (0, common_1.Post)(':id/roles'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('role:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign role to user (requires role:manage permission)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_role_dto_1.AssignRoleDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)(':id/roles/:roleId'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('role:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove role from user (requires role:manage permission)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeRole", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map