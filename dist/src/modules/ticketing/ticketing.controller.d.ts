import { TicketingService } from './ticketing.service';
export declare class TicketingController {
    private readonly ticketingService;
    constructor(ticketingService: TicketingService);
    getMyTickets(user: any): Promise<{
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
    getTicketById(id: string, user: any): Promise<{
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
    refreshQr(id: string, user: any): Promise<{
        qrToken: string;
        expiresAt: Date;
    }>;
}
