import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseStatusDto } from './dto/update-expense-status.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('api/v1/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an expense (DRAFT or submit immediately to PENDING)' })
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.createExpense(user.id, dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all expense categories (reference data)' })
  listCategories() {
    return this.expensesService.listCategories();
  }

  @Get('reports')
  @ApiOperation({ summary: 'Aggregated expense reports by status, category, and event (admin only)' })
  getReports(@CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('expense:manage_all');
    return this.expensesService.getReports(hasGlobalPerm, user.id);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export all expenses as structured JSON for CSV/Excel (admin only)' })
  exportExpenses(@CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('expense:manage_all');
    return this.expensesService.exportExpenses(hasGlobalPerm);
  }

  @Get()
  @ApiOperation({ summary: 'List expenses (admin: all, user: own)' })
  list(@Query() query: ExpenseQueryDto, @CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('expense:manage_all');
    return this.expensesService.listExpenses(user.id, hasGlobalPerm, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense details (owner or admin)' })
  getById(@Param('id') id: string, @CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('expense:manage_all');
    return this.expensesService.getExpenseById(id, user.id, hasGlobalPerm);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update expense status',
    description: `
Admins: APPROVED / REJECTED / NEEDS_REVISION
Submitter: resubmit DRAFT or NEEDS_REVISION → PENDING

REJECTED and NEEDS_REVISION require a comment.
    `.trim(),
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseStatusDto,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('expense:manage_all');
    return this.expensesService.updateStatus(id, user.id, hasGlobalPerm, dto);
  }
}
