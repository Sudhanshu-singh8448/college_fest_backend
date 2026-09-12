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

    // 2. Resolve Participant from QR Token / Registration Number / Ticket ID
    let participantId: string | null = null;
    try {
      const { payload } = await this.ticketingService.verifyQrToken(qrToken);
      participantId = payload.sub;
    } catch (_) {
      // Fallback: check if qrToken is a registrationNumber or userId or ticketId
      const cleanToken = qrToken.trim();
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { registrationNumber: cleanToken },
            { id: cleanToken },
          ],
        },
      });
      if (user) {
        participantId = user.id;
      } else {
        const ticket = await this.prisma.ticket.findUnique({
          where: { id: cleanToken },
        });
        if (ticket) participantId = ticket.userId;
      }
    }

    if (!participantId) {
      throw new UnauthorizedException('Invalid or expired QR ticket pass');
    }

    // 3. Verify user is registered AND APPROVED for the event
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId: participantId } },
      include: {
        user: { include: { profile: true } },
      },
    });

    if (!registration) {
      // Check if user is registered for other events to provide clear club mismatch feedback
      const otherRegs = await this.prisma.eventRegistration.findMany({
        where: { userId: participantId, status: { in: ['APPROVED', 'CHECKED_IN'] } },
        include: { event: true },
        take: 3,
      });
      if (otherRegs.length > 0) {
        const otherNames = otherRegs
          .map((r) => `"${r.event.name}" (${r.event.category})`)
          .join(', ');
        throw new ForbiddenException(
          `Attendee is registered for ${otherNames}, but is NOT registered for "${event.name}".`,
        );
      }
      throw new ForbiddenException(`Attendee is not registered for "${event.name}"`);
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
        message: `Attendee already checked in at ${existing.scannedAt.toLocaleTimeString()}`,
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
    const user = registration.user;

    return {
      status: 'CHECKED_IN',
      userName:
        `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() || user?.registrationNumber || 'Attendee',
      registrationNumber: user?.registrationNumber,
      eventName: event.name,
      eventCategory: event.category,
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
