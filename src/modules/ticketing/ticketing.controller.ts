import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TicketingService } from './ticketing.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Ticketing')
@ApiBearerAuth()
@Controller('api/v1/tickets')
export class TicketingController {
  constructor(private readonly ticketingService: TicketingService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get my tickets' })
  async getMyTickets(@CurrentUser() user: any) {
    return this.ticketingService.getMyTickets(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details (owner or admin)' })
  async getTicketById(@Param('id') id: string, @CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('ticket:manage_all');
    return this.ticketingService.getTicketById(id, user.id, hasGlobalPerm);
  }

  @Post(':id/refresh-qr')
  @ApiOperation({ summary: 'Generate short-lived QR JWT payload' })
  async refreshQr(@Param('id') id: string, @CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('ticket:manage_all');
    return this.ticketingService.refreshQr(id, user.id, hasGlobalPerm);
  }
}
