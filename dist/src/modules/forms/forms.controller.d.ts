import { FormsService } from './forms.service';
import { UpdateFormDto } from './dto/update-form.dto';
export declare class FormsController {
    private readonly formsService;
    constructor(formsService: FormsService);
    getForm(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        isActive: boolean;
        schema: import("@prisma/client/runtime/client").JsonValue;
        version: number;
    }>;
    updateForm(id: string, dto: UpdateFormDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        isActive: boolean;
        schema: import("@prisma/client/runtime/client").JsonValue;
        version: number;
    }>;
}
