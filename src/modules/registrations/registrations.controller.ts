import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Registrations')
@ApiBearerAuth()
@Controller('api/v1')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('events/:id/register')
  @ApiOperation({ summary: 'Register for an event' })
  async register(
    @Param('id') eventId: string,
    @Body() dto: CreateRegistrationDto,
    @CurrentUser() user: any,
  ) {
    return this.registrationsService.register(eventId, user.id, dto);
  }

  @Get('events/:id/registrations')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('registration:view')
  @ApiOperation({
    summary: 'Get all registrations for an event (organizers only)',
  })
  async getEventRegistrations(
    @Param('id') eventId: string,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('registration:manage_all');
    return this.registrationsService.getEventRegistrations(
      eventId,
      user.id,
      hasGlobalPerm,
    );
  }

  @Get('registrations/my')
  @ApiOperation({ summary: 'Get my registrations' })
  async getMyRegistrations(@CurrentUser() user: any) {
    return this.registrationsService.getMyRegistrations(user.id);
  }

  @Get('registrations/:id')
  @ApiOperation({ summary: 'Get registration by ID (owner or organizer)' })
  async getRegistrationById(@Param('id') id: string, @CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('registration:manage_all');
    return this.registrationsService.getRegistrationById(
      id,
      user.id,
      hasGlobalPerm,
    );
  }

  @Patch('registrations/:id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('registration:approve')
  @ApiOperation({ summary: 'Update registration status (organizers only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRegistrationStatusDto,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('registration:manage_all');
    return this.registrationsService.updateStatus(
      id,
      dto,
      user.id,
      hasGlobalPerm,
    );
  }

  @Post('events/:id/registrations/approve-all')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('registration:approve')
  @ApiOperation({
    summary: 'Bulk approve pending registrations (organizers only)',
  })
  async approveAll(@Param('id') eventId: string, @CurrentUser() user: any) {
    const hasGlobalPerm = user.permissions.includes('registration:manage_all');
    return this.registrationsService.approveAll(
      eventId,
      user.id,
      hasGlobalPerm,
    );
  }

  @Delete('registrations/:id')
  @ApiOperation({ summary: 'Delete (cancel) own registration' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.registrationsService.remove(id, user.id);
  }

  @Get('events/:id/registrations/export')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('registration:view')
  @ApiOperation({ summary: 'Export registrations (organizers only)' })
  async exportRegistrations(
    @Param('id') eventId: string,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm = user.permissions.includes('registration:manage_all');
    return this.registrationsService.exportRegistrations(
      eventId,
      user.id,
      hasGlobalPerm,
    );
  }
}
