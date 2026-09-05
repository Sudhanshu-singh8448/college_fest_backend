import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseStatusDto } from './dto/update-expense-status.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── POST /expenses ─────────────────────────────────
  /**
   * Create an expense (DRAFT or immediately PENDING if submit=true).
   */
  async createExpense(userId: string, dto: CreateExpenseDto) {
    // Validate category exists
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Expense category not found');

    // If eventId provided, validate event exists
    if (dto.eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: dto.eventId },
      });
      if (!event) throw new NotFoundException('Event not found');
    }

    // If a receipt file ID is provided, resolve its URL and validate ownership
    let receiptUrl: string | undefined;
    if (dto.receiptFileId) {
      const file = await this.prisma.file.findUnique({
        where: { id: dto.receiptFileId },
      });
      if (!file || file.uploaderId !== userId)
        throw new BadRequestException('Invalid receipt file');
      if (file.status !== 'CONFIRMED')
        throw new BadRequestException('Receipt file upload is not confirmed');
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
        submitter: {
          select: { id: true, registrationNumber: true, profile: true },
        },
      },
    });
  }

  // ── GET /expenses ──────────────────────────────────
  /**
   * List expenses. Admins see all; regular users see only their own.
   */
  async listExpenses(
    userId: string,
    hasGlobalPerm: boolean,
    query: ExpenseQueryDto,
  ) {
    const { page = 1, limit = 20, status, eventId, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (!hasGlobalPerm) where.submitterId = userId; // Regular users see only own
    if (status) where.status = status;
    if (eventId) where.eventId = eventId;
    if (categoryId) where.categoryId = categoryId;

    const [items, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          event: { select: { id: true, name: true } },
          submitter: {
            select: {
              id: true,
              registrationNumber: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── GET /expenses/categories ───────────────────────
  /**
   * List all expense categories (reference data).
   */
  async listCategories() {
    return this.prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
  }

  // ── GET /expenses/:id ──────────────────────────────
  /**
   * Get one expense by ID. Owner or admin only.
   */
  async getExpenseById(id: string, userId: string, hasGlobalPerm: boolean) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
        event: { select: { id: true, name: true } },
        submitter: {
          select: { id: true, registrationNumber: true, profile: true },
        },
      },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    if (!hasGlobalPerm && expense.submitterId !== userId) {
      throw new ForbiddenException('You cannot view this expense');
    }
    return expense;
  }

  // ── PATCH /expenses/:id/status ─────────────────────
  /**
   * Approve, reject, or flag for revision. Admin/approver only.
   * Users can also resubmit their own NEEDS_REVISION expense (→ PENDING).
   */
  async updateStatus(
    id: string,
    userId: string,
    hasGlobalPerm: boolean,
    dto: UpdateExpenseStatusDto,
  ) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');

    // Owner can resubmit NEEDS_REVISION → PENDING
    if (dto.status === 'PENDING' && expense.submitterId === userId) {
      if (expense.status !== 'NEEDS_REVISION' && expense.status !== 'DRAFT') {
        throw new BadRequestException(
          'Only DRAFT or NEEDS_REVISION expenses can be resubmitted',
        );
      }
    } else {
      // For approve/reject/needs_revision — must have global perm
      if (!hasGlobalPerm)
        throw new ForbiddenException(
          'Insufficient permissions to update expense status',
        );
    }

    // Require a comment for REJECTED or NEEDS_REVISION
    if (['REJECTED', 'NEEDS_REVISION'].includes(dto.status) && !dto.comment) {
      throw new BadRequestException(
        `A comment is required when setting status to ${dto.status}`,
      );
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

  // ── GET /expenses/reports ──────────────────────────
  /**
   * Aggregated expense report: totals by status, category, and event.
   */
  async getReports(hasGlobalPerm: boolean, userId: string) {
    if (!hasGlobalPerm)
      throw new ForbiddenException('Insufficient permissions');

    const [byStatus, byCategory, byEvent, total] = await Promise.all([
      // By status
      this.prisma.expense.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { id: true },
      }),
      // By category
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      // By event (top 10 events by spend)
      this.prisma.expense.groupBy({
        by: ['eventId'],
        where: { eventId: { not: null } },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      }),
      // Grand total
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'APPROVED' },
      }),
    ]);

    // Enrich category names
    const categories = await this.prisma.expenseCategory.findMany();
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    return {
      grandTotal: { approved: total._sum.amount ?? 0, count: total._count.id },
      byStatus: byStatus.map((r) => ({
        status: r.status,
        total: r._sum.amount ?? 0,
        count: r._count.id,
      })),
      byCategory: byCategory.map((r) => ({
        categoryId: r.categoryId,
        categoryName: catMap[r.categoryId] ?? 'Unknown',
        total: r._sum.amount ?? 0,
        count: r._count.id,
      })),
      topEventsBySpend: byEvent.map((r) => ({
        eventId: r.eventId,
        total: r._sum.amount ?? 0,
        count: r._count.id,
      })),
    };
  }

  // ── GET /expenses/export ───────────────────────────
  /**
   * Export expenses as structured JSON for CSV/Excel generation on the client.
   * (In production: pipe through exceljs or papaparse and stream as file download)
   */
  async exportExpenses(hasGlobalPerm: boolean) {
    if (!hasGlobalPerm)
      throw new ForbiddenException('Insufficient permissions');

    const expenses = await this.prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        event: { select: { id: true, name: true } },
        submitter: {
          select: {
            registrationNumber: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return expenses.map((e) => ({
      id: e.id,
      submitter:
        `${e.submitter.profile?.firstName ?? ''} ${e.submitter.profile?.lastName ?? ''}`.trim(),
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
}
