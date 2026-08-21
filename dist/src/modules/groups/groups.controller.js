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
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const groups_service_1 = require("./groups.service");
const create_group_dto_1 = require("./dto/create-group.dto");
const update_group_dto_1 = require("./dto/update-group.dto");
const add_member_dto_1 = require("./dto/add-member.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let GroupsController = class GroupsController {
    groupsService;
    constructor(groupsService) {
        this.groupsService = groupsService;
    }
    async findMyGroups(user) {
        return this.groupsService.findMyGroups(user.id);
    }
    async findOne(id, user) {
        return this.groupsService.findOne(id, user.id);
    }
    async create(dto, user) {
        return this.groupsService.create(dto, user.id);
    }
    async update(id, dto, user) {
        return this.groupsService.update(id, dto, user.id);
    }
    async remove(id) {
        return this.groupsService.remove(id);
    }
    async getMembers(id, user) {
        return this.groupsService.getMembers(id, user.id);
    }
    async addMember(id, dto, user) {
        return this.groupsService.addMember(id, dto.userId, user.id);
    }
    async removeMember(id, userId, user) {
        return this.groupsService.removeMember(id, userId, user.id);
    }
};
exports.GroupsController = GroupsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my groups' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "findMyGroups", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get group by ID (must be a member)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('group:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a group (requires group:create)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update group (must be a member)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_group_dto_1.UpdateGroupDto, Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('group:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete group (requires group:create)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: 'Get group members (must be a member)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: 'Add member to group (must be a member)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_member_dto_1.AddMemberDto, Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove member from group (must be a member)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "removeMember", null);
exports.GroupsController = GroupsController = __decorate([
    (0, swagger_1.ApiTags)('Groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/groups'),
    __metadata("design:paramtypes", [groups_service_1.GroupsService])
], GroupsController);
//# sourceMappingURL=groups.controller.js.map