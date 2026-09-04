import { PrismaService } from '../../database/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createFeedback(userId: string, dto: CreateFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string | null;
        content: string;
        category: string;
        adminResponse: string | null;
    }>;
    listFeedback(userId: string, hasGlobalPerm: boolean, query: {
        status?: string;
        category?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        items: {
            user: {
                id: string;
                registrationNumber: string;
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
            } | null | undefined;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            userId: string | null;
            content: string;
            category: string;
            adminResponse: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateFeedback(id: string, userId: string, hasGlobalPerm: boolean, dto: UpdateFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string | null;
        content: string;
        category: string;
        adminResponse: string | null;
    }>;
}
