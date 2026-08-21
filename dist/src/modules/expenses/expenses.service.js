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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createExpense(userId, dto) {
        const category = await this.prisma.expenseCategory.findUnique({ where: { id: dto.categoryId } });
        if (!category)
            throw new common_1.NotFoundException('Expense category not found');
        if (dto.eventId) {
            const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
            if (!event)
                throw new common_1.NotFoundException('Event not found');
        }
        let receiptUrl;
        if (dto.receiptFileId) {
            const file = await this.prisma.file.findUnique({ where: { id: dto.receiptFileId } });
            if (!file || file.uploaderId !== userId)
                throw new common_1.BadRequestException('Invalid receipt file');
            if (file.status !== 'CONFIRMED')
                throw new common_1.BadRequestException('Receipt file upload is not confirmed');
            receiptUrl = file.url;
        }
        return this.prisma.expense.create({
            data: {
                submitterId: userId,
                categoryId: dto.categoryId,
                eventId: dto.eventId,
                amount: dto.amount,
                description: dto.description,
                receiptUrl,
                status: dto.submit ? 'PENDING' : 'DRAFT',
            },
            include: {
                category: true,
                event: { select: { id: true, name: true } },
                submitter: { select: { id: true, registrationNumber: true, profile: true } },
            },
        });
    }
    async listExpenses(userId, hasGlobalPerm, query) {
        const { page = 1, limit = 20, status, eventId, categoryId } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (!hasGlobalPerm)
            where.submitterId = userId;
        if (status)
            where.status = status;
        if (eventId)
            where.eventId = eventId;
        if (categoryId)
            where.categoryId = categoryId;
        const [items, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    event: { select: { id: true, name: true } },
                    submitter: { select: { id: true, registrationNumber: true, profile: { select: { firstName: true, lastName: true } } } },
                },
            }),
            this.prisma.expense.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async listCategories() {
        return this.prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
    }
    async getExpenseById(id, userId, hasGlobalPerm) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: {
                category: true,
                event: { select: { id: true, name: true } },
                submitter: { select: { id: true, registrationNumber: true, profile: true } },
            },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        if (!hasGlobalPerm && expense.submitterId !== userId) {
            throw new common_1.ForbiddenException('You cannot view this expense');
        }
        return expense;
    }
    async updateStatus(id, userId, hasGlobalPerm, dto) {
        const expense = await this.prisma.expense.findUnique({ where: { id } });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        if (dto.status === 'PENDING' && expense.submitterId === userId) {
            if (expense.status !== 'NEEDS_REVISION' && expense.status !== 'DRAFT') {
                throw new common_1.BadRequestException('Only DRAFT or NEEDS_REVISION expenses can be resubmitted');
            }
        }
        else {
            if (!hasGlobalPerm)
                throw new common_1.ForbiddenException('Insufficient permissions to update expense status');
        }
        if (['REJECTED', 'NEEDS_REVISION'].includes(dto.status) && !dto.comment) {
            throw new common_1.BadRequestException(`A comment is required when setting status to ${dto.status}`);
        }
        return this.prisma.expense.update({
            where: { id },
            data: { status: dto.status },
            include: {
                category: true,
                submitter: { select: { id: true, registrationNumber: true } },
            },
        });
    }
    async getReports(hasGlobalPerm, userId) {
        if (!hasGlobalPerm)
            throw new common_1.ForbiddenException('Insufficient permissions');
        const [byStatus, byCategory, byEvent, total] = await Promise.all([
            this.prisma.expense.groupBy({
                by: ['status'],
                _sum: { amount: true },
                _count: { id: true },
            }),
            this.prisma.expense.groupBy({
                by: ['categoryId'],
                _sum: { amount: true },
                _count: { id: true },
                orderBy: { _sum: { amount: 'desc' } },
            }),
            this.prisma.expense.groupBy({
                by: ['eventId'],
                where: { eventId: { not: null } },
                _sum: { amount: true },
                _count: { id: true },
                orderBy: { _sum: { amount: 'desc' } },
                take: 10,
            }),
            this.prisma.expense.aggregate({
                _sum: { amount: true },
                _count: { id: true },
                where: { status: 'APPROVED' },
            }),
        ]);
        const categories = await this.prisma.expenseCategory.findMany();
        const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
        return {
            grandTotal: { approved: total._sum.amount ?? 0, count: total._count.id },
            byStatus: byStatus.map(r => ({ status: r.status, total: r._sum.amount ?? 0, count: r._count.id })),
            byCategory: byCategory.map(r => ({ categoryId: r.categoryId, categoryName: catMap[r.categoryId] ?? 'Unknown', total: r._sum.amount ?? 0, count: r._count.id })),
            topEventsBySpend: byEvent.map(r => ({ eventId: r.eventId, total: r._sum.amount ?? 0, count: r._count.id })),
        };
    }
    async exportExpenses(hasGlobalPerm) {
        if (!hasGlobalPerm)
            throw new common_1.ForbiddenException('Insufficient permissions');
        const expenses = await this.prisma.expense.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                event: { select: { id: true, name: true } },
                submitter: { select: { registrationNumber: true, profile: { select: { firstName: true, lastName: true } } } },
            },
        });
        return expenses.map(e => ({
            id: e.id,
            submitter: `${e.submitter.profile?.firstName ?? ''} ${e.submitter.profile?.lastName ?? ''}`.trim(),
            registrationNumber: e.submitter.registrationNumber,
            category: e.category.name,
            event: e.event?.name ?? 'N/A',
            amount: e.amount,
            description: e.description,
            status: e.status,
            receiptUrl: e.receiptUrl ?? '',
            createdAt: e.createdAt.toISOString(),
        }));
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map