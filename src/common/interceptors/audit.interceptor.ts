import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only log state-changing operations
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    const user = request.user;
    const url = request.url;
    const ip = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              actorId: user?.id || null,
              action: `${method} ${url}`,
              resourceType: this.extractResourceType(url),
              resourceId: this.extractResourceId(url),
              newValue: responseData ? JSON.parse(JSON.stringify(responseData)) : null,
              ipAddress: ip,
              userAgent: userAgent,
            },
          });
        } catch {
          // Silently fail — audit logging should never break the request
        }
      }),
    );
  }

  private extractResourceType(url: string): string {
    const segments = url.split('/').filter(Boolean);
    // /api/v1/events/123 → 'events'
    return segments[2] || 'unknown';
  }

  private extractResourceId(url: string): string | null {
    const segments = url.split('/').filter(Boolean);
    // /api/v1/events/123 → '123'
    const id = segments[3];
    // If it looks like a UUID, return it
    if (id && /^[0-9a-f-]{36}$/i.test(id)) {
      return id;
    }
    return null;
  }
}
