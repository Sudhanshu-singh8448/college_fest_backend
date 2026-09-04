import { PrismaService } from '../../database/prisma.service';
import { UpdateFormDto } from './dto/update-form.dto';
export declare class FormsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getForm(eventId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        eventId: string;
        schema: import("@prisma/client/runtime/client").JsonValue;
        version: number;
    }>;
    updateForm(eventId: string, dto: UpdateFormDto, userId: string, hasGlobalPerm: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        eventId: string;
        schema: import("@prisma/client/runtime/client").JsonValue;
        version: number;
    }>;
}
