export declare class AuditLogQueryDto {
    actorId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
