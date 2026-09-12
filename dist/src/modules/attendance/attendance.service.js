"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const ticketing_service_1 = require("../ticketing/ticketing.service");
let AttendanceService = class AttendanceService {
    prisma;
    ticketingService;
    constructor(prisma, ticketingService) {
        this.prisma = prisma;
        this.ticketingService = ticketingService;
    }
    async verifyQr(qrToken) {
        const { payload, ticket } = await this.ticketingService.verifyQrToken(qrToken);
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { profile: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User associated with ticket not found');
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
    async checkIn(eventId, qrToken, actorId, hasGlobalPerm) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (!hasGlobalPerm) {
            const org = await this.prisma.eventOrganizer.findUnique({
                where: { eventId_userId: { eventId, userId: actorId } },
            });
            if (!org)
                throw new common_1.ForbiddenException('You are not an organizer for this event');
        }
        let participantId = null;
        try {
            const { payload } = await this.ticketingService.verifyQrToken(qrToken);
            participantId = payload.sub;
        }
        catch (_) {
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
            }
            else {
                const ticket = await this.prisma.ticket.findUnique({
                    where: { id: cleanToken },
                });
                if (ticket)
                    participantId = ticket.userId;
            }
        }
        if (!participantId) {
            throw new common_1.UnauthorizedException('Invalid or expired QR ticket pass');
        }
        const registration = await this.prisma.eventRegistration.findUnique({
            where: { eventId_userId: { eventId, userId: participantId } },
            include: {
                user: { include: { profile: true } },
            },
        });
        if (!registration) {
            const otherRegs = await this.prisma.eventRegistration.findMany({
                where: { userId: participantId, status: { in: ['APPROVED', 'CHECKED_IN'] } },
                include: { event: true },
                take: 3,
            });
            if (otherRegs.length > 0) {
                const otherNames = otherRegs
                    .map((r) => `"${r.event.name}" (${r.event.category})`)
                    .join(', ');
                throw new common_1.ForbiddenException(`Attendee is registered for ${otherNames}, but is NOT registered for "${event.name}".`);
            }
            throw new common_1.ForbiddenException(`Attendee is not registered for "${event.name}"`);
        }
        if (!['APPROVED', 'COMPLETED', 'CHECKED_IN'].includes(registration.status)) {
            throw new common_1.ForbiddenException(`Registration status is ${registration.status}. Cannot check-in.`);
        }
        const existing = await this.prisma.attendance.findUnique({
            where: { eventId_userId: { eventId, userId: participantId } },
        });
        if (existing) {
            throw new common_1.ConflictException({
                error: 'ALREADY_CHECKED_IN',
                message: `Attendee already checked in at ${existing.scannedAt.toLocaleTimeString()}`,
                checkedInAt: existing.scannedAt,
                scannedBy: existing.scannedBy,
            });
        }
        const attendance = await this.prisma.attendance.create({
            data: {
                eventId,
                userId: participantId,
                scannedBy: actorId,
            },
        });
        if (registration.status === 'APPROVED') {
            await this.prisma.eventRegistration.update({
                where: { id: registration.id },
                data: { status: 'CHECKED_IN' },
            });
        }
        const user = registration.user;
        return {
            status: 'CHECKED_IN',
            userName: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() || user?.registrationNumber || 'Attendee',
            registrationNumber: user?.registrationNumber,
            eventName: event.name,
            eventCategory: event.category,
            scannedAt: attendance.scannedAt,
        };
    }
    async getEventAttendance(eventId, actorId, hasGlobalPerm) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (!hasGlobalPerm) {
            const org = await this.prisma.eventOrganizer.findUnique({
                where: { eventId_userId: { eventId, userId: actorId } },
            });
            if (!org)
                throw new common_1.ForbiddenException('You are not an organizer for this event');
        }
        return this.prisma.attendance.findMany({
            where: { eventId },
            include: {
                user: { select: { id: true, registrationNumber: true, profile: true } },
            },
            orderBy: { scannedAt: 'desc' },
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ticketing_service_1.TicketingService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map