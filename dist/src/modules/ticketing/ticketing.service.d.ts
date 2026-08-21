import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class TicketingService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    getMyTickets(userId: string): Promise<{
        fest: {
            name: string;
            id: string;
            year: number;
            startDate: Date;
            endDate: Date;
        };
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        festId: string;
        ticketNumber: string;
    }[]>;
    getTicketById(id: string, userId: string, hasGlobalPerm: boolean): Promise<{
        approvedEvents: {
            name: string;
            id: string;
            startDate: Date;
            category: string;
            venue: string | null;
        }[];
        user: {
            profile: {
                userId: string;
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
            } | null;
            id: string;
            registrationNumber: string;
            email: string | null;
        };
        fest: {
            name: string;
            id: string;
            year: number;
            startDate: Date;
            endDate: Date;
        };
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            festId: string;
            ticketNumber: string;
            qrSecret: string;
        };
    }>;
}
