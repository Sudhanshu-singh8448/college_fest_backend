import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { JwtUser } from '../interfaces/jwt-user.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method: string = request.method;

    // Only log state-changing operations
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    const user = request.user as JwtUser | undefined;
    const url: string = request.url;
    const ip: string = request.ip || '';
    const userAgent: string = (request.headers['user-agent'] as string) || '';

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              actorId: user?.id || null,
              action: `${method} ${url}`,
              resourceType: this.extractResourceType(url),
              resourceId: this.extractResourceId(url),
              newValue: responseData
                ? JSON.parse(JSON.stringify(responseData))
                : null,
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
