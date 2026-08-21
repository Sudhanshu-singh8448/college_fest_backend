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
exports.FestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fest_service_1 = require("./fest.service");
const create_fest_dto_1 = require("./dto/create-fest.dto");
const update_fest_dto_1 = require("./dto/update-fest.dto");
const update_guidelines_dto_1 = require("./dto/update-guidelines.dto");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let FestController = class FestController {
    festService;
    constructor(festService) {
        this.festService = festService;
    }
    async findAll() {
        return this.festService.findAll();
    }
    async getActiveFest() {
        return this.festService.getActiveFest();
    }
    async findOne(id) {
        return this.festService.findOne(id);
    }
    async create(dto) {
        return this.festService.create(dto);
    }
    async update(id, dto) {
        return this.festService.update(id, dto);
    }
    async getGuidelines(id) {
        return this.festService.getGuidelines(id);
    }
    async updateGuidelines(id, dto) {
        return this.festService.updateGuidelines(id, dto.guidelines);
    }
};
exports.FestController = FestController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all fest editions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FestController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the currently active fest' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FestController.prototype, "getActiveFest", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fest by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FestController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('fest:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new fest edition (requires fest:manage)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fest_dto_1.CreateFestDto]),
    __metadata("design:returntype", Promise)
], FestController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('fest:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Update fest details (requires fest:manage)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_fest_dto_1.UpdateFestDto]),
    __metadata("design:returntype", Promise)
], FestController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/guidelines'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fest guidelines' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FestController.prototype, "getGuidelines", null);
__decorate([
    (0, common_1.Put)(':id/guidelines'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('guidelines:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Update fest guidelines (requires guidelines:manage)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_guidelines_dto_1.UpdateGuidelinesDto]),
    __metadata("design:returntype", Promise)
], FestController.prototype, "updateGuidelines", null);
exports.FestController = FestController = __decorate([
    (0, swagger_1.ApiTags)('Fest'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/fests'),
    __metadata("design:paramtypes", [fest_service_1.FestService])
], FestController);
//# sourceMappingURL=fest.controller.js.map