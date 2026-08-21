import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/v1')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ── In-App Notifications ───────────────────────────

  @Get('notifications')
  @ApiOperation({ summary: 'List my notifications (paginated, filterable by unread)' })
  getNotifications(@Query() query: NotificationQueryDto, @CurrentUser() user: any) {
    return this.notificationsService.getNotifications(user.id, query);
  }

  @Post('notifications/read')
  @ApiOperation({ summary: 'Mark specific or all notifications as read' })
  markRead(@Body() dto: MarkReadDto, @CurrentUser() user: any) {
    return this.notificationsService.markRead(user.id, dto);
  }

  // ── Preferences ────────────────────────────────────

  @Get('notifications/preferences')
  @ApiOperation({ summary: 'Get per-type notification preferences (defaults shown for unset types)' })
  getPreferences(@CurrentUser() user: any) {
    return this.notificationsService.getPreferences(user.id);
  }

  @Put('notifications/preferences')
  @ApiOperation({ summary: 'Update notification preferences for one or more types' })
  updatePreferences(@Body() dto: UpdatePreferencesDto, @CurrentUser() user: any) {
    return this.notificationsService.updatePreferences(user.id, dto);
  }

  // ── Device Tokens ──────────────────────────────────

  @Post('device-tokens')
  @ApiOperation({ summary: 'Register FCM device token for push notifications' })
  registerDeviceToken(@Body() dto: RegisterDeviceTokenDto, @CurrentUser() user: any) {
    return this.notificationsService.registerDeviceToken(user.id, dto);
  }

  @Delete('device-tokens/:id')
  @ApiOperation({ summary: 'Remove a device token (on logout / token rotation)' })
  removeDeviceToken(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.removeDeviceToken(id, user.id);
  }
}
