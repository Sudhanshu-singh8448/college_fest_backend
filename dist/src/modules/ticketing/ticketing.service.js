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
exports.TicketingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
let TicketingService = class TicketingService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async getMyTickets(userId) {
        const tickets = await this.prisma.ticket.findMany({
            where: { userId },
            include: {
                fest: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return tickets.map((t) => {
            const { qrSecret, ...safeTicket } = t;
            return safeTicket;
        });
    }
    async getTicketById(id, userId, hasGlobalPerm) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                fest: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        startDate: true,
                        endDate: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        registrationNumber: true,
                        profile: true,
                    },
                },
            },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        if (!hasGlobalPerm && ticket.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this ticket');
        }
        const registrations = await this.prisma.eventRegistration.findMany({
            where: {
                userId: ticket.userId,
                status: { in: ['APPROVED', 'COMPLETED', 'CHECKED_IN'] },
                event: { festId: ticket.festId },
            },
            include: {
                event: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        startDate: true,
                        venue: true,
                    },
                },
            },
        });
        const { qrSecret, ...safeTicket } = ticket;
        return { ...safeTicket, approvedEvents: registrations.map((r) => r.event) };
    }
    async refreshQr(id, userId, hasGlobalPerm) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        if (!ticket.isActive)
            throw new common_1.ForbiddenException('Ticket is deactivated');
        if (!hasGlobalPerm && ticket.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this ticket');
        }
        const jti = (0, uuid_1.v4)();
        const payload = {
            sub: ticket.userId,
            tid: ticket.id,
            fid: ticket.festId,
            jti,
        };
        const qrToken = this.jwtService.sign(payload, {
            secret: ticket.qrSecret,
            expiresIn: '5m',
        });
        return { qrToken, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
    }
    async verifyQrToken(qrToken) {
        try {
            const decoded = this.jwtService.decode(qrToken);
            if (!decoded || !decoded.tid) {
                throw new common_1.UnauthorizedException('Invalid QR format');
            }
            const ticket = await this.prisma.ticket.findUnique({
                where: { id: decoded.tid },
            });
            if (!ticket)
                throw new common_1.UnauthorizedException('Ticket not found');
            if (!ticket.isActive)
                throw new common_1.UnauthorizedException('Ticket inactive');
            const payload = this.jwtService.verify(qrToken, {
                secret: ticket.qrSecret,
            });
            return { payload, ticket };
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid or expired QR code');
        }
    }
};
exports.TicketingService = TicketingService;
exports.TicketingService = TicketingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], TicketingService);
//# sourceMappingURL=ticketing.service.js.map