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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const expenses_service_1 = require("./expenses.service");
const create_expense_dto_1 = require("./dto/create-expense.dto");
const update_expense_status_dto_1 = require("./dto/update-expense-status.dto");
const expense_query_dto_1 = require("./dto/expense-query.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ExpensesController = class ExpensesController {
    expensesService;
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    create(dto, user) {
        return this.expensesService.createExpense(user.id, dto);
    }
    listCategories() {
        return this.expensesService.listCategories();
    }
    getReports(user) {
        const hasGlobalPerm = user.permissions.includes('expense:manage_all');
        return this.expensesService.getReports(hasGlobalPerm, user.id);
    }
    exportExpenses(user) {
        const hasGlobalPerm = user.permissions.includes('expense:manage_all');
        return this.expensesService.exportExpenses(hasGlobalPerm);
    }
    list(query, user) {
        const hasGlobalPerm = user.permissions.includes('expense:manage_all');
        return this.expensesService.listExpenses(user.id, hasGlobalPerm, query);
    }
    getById(id, user) {
        const hasGlobalPerm = user.permissions.includes('expense:manage_all');
        return this.expensesService.getExpenseById(id, user.id, hasGlobalPerm);
    }
    updateStatus(id, dto, user) {
        const hasGlobalPerm = user.permissions.includes('expense:manage_all');
        return this.expensesService.updateStatus(id, user.id, hasGlobalPerm, dto);
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create an expense (DRAFT or submit immediately to PENDING)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List all expense categories (reference data)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Get)('reports'),
    (0, swagger_1.ApiOperation)({
        summary: 'Aggregated expense reports by status, category, and event (admin only)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({
        summary: 'Export all expenses as structured JSON for CSV/Excel (admin only)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "exportExpenses", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List expenses (admin: all, user: own)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [expense_query_dto_1.ExpenseQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expense details (owner or admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update expense status',
        description: `
Admins: APPROVED / REJECTED / NEEDS_REVISION
Submitter: resubmit DRAFT or NEEDS_REVISION → PENDING

REJECTED and NEEDS_REVISION require a comment.
    `.trim(),
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_expense_status_dto_1.UpdateExpenseStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "updateStatus", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, swagger_1.ApiTags)('Expenses'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/expenses'),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map