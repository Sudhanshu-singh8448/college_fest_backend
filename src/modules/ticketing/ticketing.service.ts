import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ── GET /tickets/my ─────────────────────────────
  async getMyTickets(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: {
        fest: { select: { id: true, name: true, year: true, startDate: true, endDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map(t => {
      const { qrSecret, ...safeTicket } = t;
      return safeTicket;
    });
  }

  // ── GET /tickets/:id ────────────────────────────
  async getTicketById(id: string, userId: string, hasGlobalPerm: boolean) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        fest: { select: { id: true, name: true, year: true, startDate: true, endDate: true } },
        user: { select: { id: true, email: true, registrationNumber: true, profile: true } },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!hasGlobalPerm && ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    // Fetch approved event registrations for this ticket's fest
    const registrations = await this.prisma.eventRegistration.findMany({
      where: {
        userId: ticket.userId,
        status: { in: ['APPROVED', 'COMPLETED', 'CHECKED_IN'] },
        event: { festId: ticket.festId },
      },
      include: {
        event: { select: { id: true, name: true, category: true, startDate: true, venue: true } },
      },
    });

    const { qrSecret, ...safeTicket } = ticket;
    return { ...safeTicket, approvedEvents: registrations.map(r => r.event) };
  }

  // ── POST /tickets/:id/refresh-qr ────────────────
  async refreshQr(id: string, userId: string, hasGlobalPerm: boolean) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!ticket.isActive) throw new ForbiddenException('Ticket is deactivated');

    if (!hasGlobalPerm && ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    const jti = uuidv4();
    const payload = {
      sub: ticket.userId,
      tid: ticket.id,
      fid: ticket.festId,
      jti,
    };

    const qrToken = this.jwtService.sign(payload, {
      secret: ticket.qrSecret,
      expiresIn: '5m', // Short-lived QR code
    });

    return { qrToken, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
  }

  // ── VERIFY (Internal used by Attendance) ────────
  async verifyQrToken(qrToken: string) {
    try {
      // Decode without verification first to get the ticket ID
      const decoded = this.jwtService.decode(qrToken) as any;
      if (!decoded || !decoded.tid) {
        throw new UnauthorizedException('Invalid QR format');
      }

      const ticket = await this.prisma.ticket.findUnique({
        where: { id: decoded.tid },
      });

      if (!ticket) throw new UnauthorizedException('Ticket not found');
      if (!ticket.isActive) throw new UnauthorizedException('Ticket inactive');

      // Verify signature with ticket's specific secret
      const payload = this.jwtService.verify(qrToken, {
        secret: ticket.qrSecret,
      });

      return { payload, ticket };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired QR code');
    }
  }
}
