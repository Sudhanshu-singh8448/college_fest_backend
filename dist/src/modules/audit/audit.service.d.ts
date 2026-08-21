import { PrismaService } from '../../database/prisma.service';
export interface AuditLogPayload {
    actorId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(payload: AuditLogPayload): Promise<void>;
}
