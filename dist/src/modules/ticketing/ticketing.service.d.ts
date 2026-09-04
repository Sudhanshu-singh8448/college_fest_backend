import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class TicketingService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    getMyTickets(userId: string): Promise<{
        fest: {
            id: string;
            name: string;
            year: number;
            startDate: Date;
            endDate: Date;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        festId: string;
        ticketNumber: string;
    }[]>;
    getTicketById(id: string, userId: string, hasGlobalPerm: boolean): Promise<{
        approvedEvents: {
            id: string;
            name: string;
            startDate: Date;
            category: string;
            venue: string | null;
        }[];
        user: {
            id: string;
            registrationNumber: string;
            email: string | null;
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
        fest: {
            id: string;
            name: string;
            year: number;
            startDate: Date;
            endDate: Date;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        festId: string;
        ticketNumber: string;
    }>;
    refreshQr(id: string, userId: string, hasGlobalPerm: boolean): Promise<{
        qrToken: string;
        expiresAt: Date;
    }>;
    verifyQrToken(qrToken: string): Promise<{
        payload: any;
        ticket: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isActive: boolean;
            festId: string;
            ticketNumber: string;
            qrSecret: string;
        };
    }>;
}
