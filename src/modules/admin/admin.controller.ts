import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateRegNumberFormatDto } from './dto/update-reg-format.dto';
import { SetEventWinnersDto } from './dto/set-event-winners.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/** Reusable permission guard helper */
function requirePerm(user: any, perm: string) {
  if (!user.permissions?.includes(perm)) {
    throw new ForbiddenException(`Permission "${perm}" required`);
  }
}

@ApiTags('Admin & Analytics')
@ApiBearerAuth()
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Dashboard ──────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Super dashboard: users, events, finance, leaderboard KPIs in one call',
  })
  getDashboard(@CurrentUser() user: any) {
    requirePerm(user, 'analytics:view');
    return this.adminService.getDashboard();
  }

  // ── User Stats ─────────────────────────────────────

  @Get('users/stats')
  @ApiOperation({
    summary:
      'User statistics + searchable user list (by name, reg number, or email)',
    description:
      'Returns user list with roles/XP enriched, plus breakdowns by status and new-this-month count.',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getUserStats(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    requirePerm(user, 'analytics:view');
    return this.adminService.getUserStats({ search, page, limit });
  }

  // ── Event Stats ────────────────────────────────────

  @Get('events/stats')
  @ApiOperation({
    summary:
      'Event analytics: fill rates, attendance rates, breakdowns by category and status',
  })
  getEventStats(@CurrentUser() user: any) {
    requirePerm(user, 'analytics:view');
    return this.adminService.getEventStats();
  }

  // ── Finance Stats ──────────────────────────────────

  @Get('finance/stats')
  @ApiOperation({
    summary:
      'Finance analytics: expense totals by status/category/event, pending approval queue',
  })
  getFinanceStats(@CurrentUser() user: any) {
    requirePerm(user, 'analytics:view');
    return this.adminService.getFinanceStats();
  }

  // ── Audit Logs ─────────────────────────────────────

  @Get('audit-logs')
  @ApiOperation({
    summary: 'Search paginated audit logs (append-only, 1-year retention)',
    description:
      'Filterable by actor, action, resource type, resource ID, and date range.',
  })
  getAuditLogs(@Query() query: AuditLogQueryDto, @CurrentUser() user: any) {
    requirePerm(user, 'audit:view');
    return this.adminService.getAuditLogs(query);
  }

  // ── Settings ───────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'Get all app settings as a key-value map' })
  getSettings(@CurrentUser() user: any) {
    requirePerm(user, 'settings:manage');
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({
    summary: 'Bulk-upsert app settings',
    description:
      'Pass a key-value map. Missing keys are created; existing keys are updated.',
  })
  updateSettings(@Body() dto: UpdateSettingsDto, @CurrentUser() user: any) {
    requirePerm(user, 'settings:manage');
    return this.adminService.updateSettings(dto);
  }

  // ── Registration Number Format ─────────────────────

  @Put('reg-number-format')
  @ApiOperation({
    summary: 'Update the registration number format',
    description:
      'Supported placeholders: {YEAR}, {BRANCH}, {BATCH}, {SEQ:N}. Returns a live preview.',
  })
  updateRegNumberFormat(
    @Body() dto: UpdateRegNumberFormatDto,
    @CurrentUser() user: any,
  ) {
    requirePerm(user, 'settings:manage');
    return this.adminService.updateRegNumberFormat(dto);
  }

  // ── Event Winners ──────────────────────────────────

  @Get('events/:id/winners')
  @ApiOperation({
    summary: 'Get all winners for an event, ordered by position',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  getEventWinners(@Param('id') id: string, @CurrentUser() user: any) {
    requirePerm(user, 'analytics:view');
    return this.adminService.getEventWinners(id);
  }

  @Post('events/:id/winners')
  @ApiOperation({
    summary: 'Set (replace) all winners for an event',
    description:
      'All provided userIds must be APPROVED or CHECKED_IN participants. Replaces any existing winners.',
  })
  @ApiParam({ name: 'id', description: 'Event ID' })
  setEventWinners(
    @Param('id') id: string,
    @Body() dto: SetEventWinnersDto,
    @CurrentUser() user: any,
  ) {
    requirePerm(user, 'event:edit');
    return this.adminService.setEventWinners(id, user.id, dto);
  }

  // ── Data Export ────────────────────────────────────

  @Get('export/:type')
  @ApiOperation({
    summary: 'Export structured data as JSON (ready for client-side CSV/Excel)',
    description:
      'Supported types: **users**, **events**, **registrations**, **expenses**, **attendance**, **feedback**',
  })
  @ApiParam({
    name: 'type',
    enum: [
      'users',
      'events',
      'registrations',
      'expenses',
      'attendance',
      'feedback',
    ],
  })
  exportData(@Param('type') type: string, @CurrentUser() user: any) {
    requirePerm(user, 'analytics:view');
    return this.adminService.exportData(type);
  }
}
