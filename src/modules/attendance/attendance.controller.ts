import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { VerifyQrDto } from './dto/verify-qr.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('api/v1')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('attendance/verify')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ticket:scan')
  @ApiOperation({ summary: 'Verify a QR token without checking in' })
  async verifyQr(@Body() dto: VerifyQrDto) {
    return this.attendanceService.verifyQr(dto.qrToken);
  }

  @Post('attendance/check-in')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('attendance:manage')
  @ApiOperation({ summary: 'Check-in a user via QR to an event' })
  async checkIn(@Body() dto: CheckInDto, @CurrentUser() user: any) {
    const hasGlobalPerm: boolean = user.permissions.includes(
      'attendance:manage_all',
    );
    return this.attendanceService.checkIn(
      dto.eventId,
      dto.qrToken,
      user.id,
      hasGlobalPerm,
    );
  }

  @Get('events/:id/attendance')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('attendance:manage')
  @ApiOperation({ summary: 'Get attendance list for an event' })
  async getEventAttendance(
    @Param('id') eventId: string,
    @CurrentUser() user: any,
  ) {
    const hasGlobalPerm: boolean = user.permissions.includes(
      'attendance:manage_all',
    );
    return this.attendanceService.getEventAttendance(
      eventId,
      user.id,
      hasGlobalPerm,
    );
  }
}
