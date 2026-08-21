import { TicketingService } from './ticketing.service';
export declare class TicketingController {
    private readonly ticketingService;
    constructor(ticketingService: TicketingService);
    getMyTickets(user: any): Promise<{
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
    getTicketById(id: string, user: any): Promise<{
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
    refreshQr(id: string, user: any): Promise<{
        qrToken: string;
        expiresAt: Date;
    }>;
}
