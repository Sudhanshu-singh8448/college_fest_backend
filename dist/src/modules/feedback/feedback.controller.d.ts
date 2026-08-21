import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(dto: CreateFeedbackDto, user: any): Promise<{
        content: string;
        userId: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        adminResponse: string | null;
    }>;
    list(status?: string, category?: string, page?: number, limit?: number, user?: any): Promise<{
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
    update(id: string, dto: UpdateFeedbackDto, user: any): Promise<{
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
