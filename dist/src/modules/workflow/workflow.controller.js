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
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workflow_service_1 = require("./workflow.service");
const create_workflow_dto_1 = require("./dto/create-workflow.dto");
const update_workflow_dto_1 = require("./dto/update-workflow.dto");
const workflow_action_dto_1 = require("./dto/workflow-action.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let WorkflowController = class WorkflowController {
    workflowService;
    constructor(workflowService) {
        this.workflowService = workflowService;
    }
    async getWorkflows() {
        return this.workflowService.getWorkflows();
    }
    async createWorkflow(dto) {
        return this.workflowService.createWorkflow(dto);
    }
    async getWorkflowById(id) {
        return this.workflowService.getWorkflowById(id);
    }
    async updateWorkflow(id, dto) {
        return this.workflowService.updateWorkflow(id, dto);
    }
    async executeAction(id, dto, user) {
        const hasGlobalPerm = user.permissions.includes('workflow:manage_all');
        return this.workflowService.executeAction(id, dto, user.id, hasGlobalPerm);
    }
    async getWorkflowHistory(id, user) {
        const hasGlobalPerm = user.permissions.includes('workflow:manage_all');
        return this.workflowService.getWorkflowHistory(id, user.id, hasGlobalPerm);
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Get)('workflows'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('workflow:configure'),
    (0, swagger_1.ApiOperation)({ summary: 'List all workflows (requires workflow:configure)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflows", null);
__decorate([
    (0, common_1.Post)('workflows'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('workflow:configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new workflow (requires workflow:configure)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_workflow_dto_1.CreateWorkflowDto]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "createWorkflow", null);
__decorate([
    (0, common_1.Get)('workflows/:id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('workflow:configure'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workflow details (requires workflow:configure)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflowById", null);
__decorate([
    (0, common_1.Patch)('workflows/:id'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('workflow:configure'),
    (0, swagger_1.ApiOperation)({ summary: 'Update workflow (requires workflow:configure)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_workflow_dto_1.UpdateWorkflowDto]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "updateWorkflow", null);
__decorate([
    (0, common_1.Post)('workflow-instances/:id/action'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute an action on a workflow instance (approvers only)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, workflow_action_dto_1.WorkflowActionDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "executeAction", null);
__decorate([
    (0, common_1.Get)('workflow-instances/:id/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow history' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflowHistory", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, swagger_1.ApiTags)('Workflow'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map