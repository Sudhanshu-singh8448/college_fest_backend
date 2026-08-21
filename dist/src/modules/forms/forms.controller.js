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
exports.FormsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const forms_service_1 = require("./forms.service");
const update_form_dto_1 = require("./dto/update-form.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let FormsController = class FormsController {
    formsService;
    constructor(formsService) {
        this.formsService = formsService;
    }
    async getForm(id) {
        return this.formsService.getForm(id);
    }
    async updateForm(id, dto, user) {
        const hasGlobalPerm = user.permissions.includes('event:manage_all');
        return this.formsService.updateForm(id, dto, user.id, hasGlobalPerm);
    }
};
exports.FormsController = FormsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get event form schema' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormsController.prototype, "getForm", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('event:edit'),
    (0, swagger_1.ApiOperation)({ summary: 'Update event form schema (requires event:edit and organizer role unless global admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_form_dto_1.UpdateFormDto, Object]),
    __metadata("design:returntype", Promise)
], FormsController.prototype, "updateForm", null);
exports.FormsController = FormsController = __decorate([
    (0, swagger_1.ApiTags)('Forms'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/events/:id/form'),
    __metadata("design:paramtypes", [forms_service_1.FormsService])
], FormsController);
//# sourceMappingURL=forms.controller.js.map