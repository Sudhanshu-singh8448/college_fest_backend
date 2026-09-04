import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(dto: CreateFeedbackDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string | null;
        content: string;
        category: string;
        adminResponse: string | null;
    }>;
    list(status?: string, category?: string, page?: number, limit?: number, user?: any): Promise<{
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
    update(id: string, dto: UpdateFeedbackDto, user: any): Promise<{
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
