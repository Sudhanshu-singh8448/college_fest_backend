import { PrismaService } from '../../database/prisma.service';
import { TicketingService } from '../ticketing/ticketing.service';
export declare class AttendanceService {
    private readonly prisma;
    private readonly ticketingService;
    constructor(prisma: PrismaService, ticketingService: TicketingService);
    verifyQr(qrToken: string): Promise<{
        isValid: boolean;
        user: {
            id: string;
            email: string | null;
            registrationNumber: string;
            firstName: string | undefined;
            lastName: string | undefined;
        };
        ticket: {
            id: string;
            ticketNumber: string;
            festId: string;
        };
    }>;
    checkIn(eventId: string, qrToken: string, actorId: string, hasGlobalPerm: boolean): Promise<{
        status: string;
        userName: string;
        eventName: string;
        scannedAt: Date;
    }>;
    getEventAttendance(eventId: string, actorId: string, hasGlobalPerm: boolean): Promise<({
        user: {
            id: string;
            registrationNumber: string;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                bio: string | null;
                phone: string | null;
                collegeId: string | null;
                branchId: string | null;
                batchId: string | null;
                userId: string;
            } | null;
        };
    } & {
        id: string;
        userId: string;
        eventId: string;
        scannedBy: string | null;
        scannedAt: Date;
    })[]>;
}
