import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { AddOrganizerDto } from './dto/add-organizer.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List events with filters and pagination' })
  async findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('event:create')
  @ApiOperation({ summary: 'Create an event (requires event:create)' })
  async create(@Body() dto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('event:edit')
  @ApiOperation({
    summary:
      'Update an event (requires event:edit and organizer role unless global admin)',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('event:manage_all');
    return this.eventsService.update(id, dto, user.id, hasGlobalPerm);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('event:delete')
  @ApiOperation({ summary: 'Soft delete an event (requires event:delete)' })
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('event:edit')
  @ApiOperation({
    summary:
      'Update event status (requires event:edit and organizer role unless global admin)',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEventStatusDto,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('event:manage_all');
    return this.eventsService.updateStatus(
      id,
      dto.status,
      user.id,
      hasGlobalPerm,
    );
  }

  @Get(':id/organizers')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('event:view')
  @ApiOperation({ summary: 'Get event organizers' })
  async getOrganizers(@Param('id') id: string, @CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('event:manage_all');
    return this.eventsService.getOrganizers(id, user.id, hasGlobalPerm);
  }

  @Post(':id/organizers')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('event:edit')
  @ApiOperation({
    summary:
      'Add an organizer (requires event:edit and PRIMARY role unless global admin)',
  })
  async addOrganizer(
    @Param('id') id: string,
    @Body() dto: AddOrganizerDto,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('event:manage_all');
    return this.eventsService.addOrganizer(
      id,
      dto.userId,
      dto.role,
      user.id,
      hasGlobalPerm,
    );
  }

  @Delete(':id/organizers/:userId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('event:edit')
  @ApiOperation({
    summary:
      'Remove an organizer (requires event:edit and PRIMARY role unless global admin)',
  })
  async removeOrganizer(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('event:manage_all');
    return this.eventsService.removeOrganizer(
      id,
      targetUserId,
      user.id,
      hasGlobalPerm,
    );
  }

  @Get(':id/stats')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('event:edit')
  @ApiOperation({
    summary:
      'Get event statistics (requires event:edit and organizer role unless global admin)',
  })
  async getStats(@Param('id') id: string, @CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('event:manage_all');
    return this.eventsService.getStats(id, user.id, hasGlobalPerm);
  }
}
