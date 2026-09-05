import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TicketingService } from '../ticketing/ticketing.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketingService: TicketingService,
  ) {}

  // ── POST /attendance/verify ─────────────────────
  async verifyQr(qrToken: string) {
    // 1. Verify token via TicketingService (throws if invalid)
    const { payload, ticket } =
      await this.ticketingService.verifyQrToken(qrToken);

    // 2. Return user info associated with the ticket
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user)
      throw new NotFoundException('User associated with ticket not found');

    return {
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        registrationNumber: user.registrationNumber,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
      },
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        festId: ticket.festId,
      },
    };
  }

  // ── POST /attendance/check-in ───────────────────
  async checkIn(
    eventId: string,
    qrToken: string,
    actorId: string,
    hasGlobalPerm: boolean,
  ) {
    // 1. Check permissions (is the actor an organizer for this event, or has global perm?)
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (!hasGlobalPerm) {
      const org = await this.prisma.eventOrganizer.findUnique({
        where: { eventId_userId: { eventId, userId: actorId } },
      });
      if (!org)
        throw new ForbiddenException('You are not an organizer for this event');
    }

    // 2. Verify QR Token
    const { payload, ticket } =
      await this.ticketingService.verifyQrToken(qrToken);
    const participantId = payload.sub;

    // 3. Verify user is registered AND APPROVED for the event
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId: participantId } },
    });

    if (!registration) {
      throw new ForbiddenException('User is not registered for this event');
    }

    if (
      !['APPROVED', 'COMPLETED', 'CHECKED_IN'].includes(registration.status)
    ) {
      throw new ForbiddenException(
        `Registration status is ${registration.status}. Cannot check-in.`,
      );
    }

    // 4. Check for existing attendance (duplicate scan)
    const existing = await this.prisma.attendance.findUnique({
      where: { eventId_userId: { eventId, userId: participantId } },
    });

    if (existing) {
      throw new ConflictException({
        error: 'ALREADY_CHECKED_IN',
        checkedInAt: existing.scannedAt,
        scannedBy: existing.scannedBy,
      });
    }

    // 5. Create Attendance Record
    const attendance = await this.prisma.attendance.create({
      data: {
        eventId,
        userId: participantId,
        scannedBy: actorId,
      },
    });

    // 6. Update registration status if needed
    if (registration.status === 'APPROVED') {
      await this.prisma.eventRegistration.update({
        where: { id: registration.id },
        data: { status: 'CHECKED_IN' },
      });
    }

    // 7. Get user details to return
    const user = await this.prisma.user.findUnique({
      where: { id: participantId },
      include: { profile: true },
    });

    return {
      status: 'CHECKED_IN',
      userName:
        `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim(),
      eventName: event.name,
      scannedAt: attendance.scannedAt,
    };
  }

  // ── GET /events/:id/attendance ──────────────────
  async getEventAttendance(
    eventId: string,
    actorId: string,
    hasGlobalPerm: boolean,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (!hasGlobalPerm) {
      const org = await this.prisma.eventOrganizer.findUnique({
        where: { eventId_userId: { eventId, userId: actorId } },
      });
      if (!org)
        throw new ForbiddenException('You are not an organizer for this event');
    }

    return this.prisma.attendance.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, registrationNumber: true, profile: true } },
      },
      orderBy: { scannedAt: 'desc' },
    });
  }
}
