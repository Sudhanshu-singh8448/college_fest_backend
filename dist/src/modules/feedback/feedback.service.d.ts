import { PrismaService } from '../../database/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createFeedback(userId: string, dto: CreateFeedbackDto): Promise<{
        content: string;
        userId: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
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
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
                id: string;
                registrationNumber: string;
            } | null | undefined;
            content: string;
            userId: string | null;
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
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
        content: string;
        userId: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        adminResponse: string | null;
    }>;
}
