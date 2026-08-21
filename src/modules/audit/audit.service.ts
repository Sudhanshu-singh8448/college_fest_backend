import { Injectable } from '@nestjs/common';
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

/**
 * AuditService — append-only audit trail.
 * Called by services and interceptors to log all state-changing actions.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Write one audit log entry. Fire-and-forget (does not throw).
   */
  async log(payload: AuditLogPayload): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: payload.actorId ?? null,
          action: payload.action,
          resourceType: payload.resourceType,
          resourceId: payload.resourceId ?? null,
          oldValue: payload.oldValue ?? undefined,
          newValue: payload.newValue ?? undefined,
          ipAddress: payload.ipAddress ?? null,
          userAgent: payload.userAgent ?? null,
        },
      });
    } catch {
      // Audit logging must never crash the main request
    }
  }
}
