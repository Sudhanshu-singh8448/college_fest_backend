import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  // ── POST /feedback ─────────────────────────────────
  /**
   * Submit feedback. Optionally anonymous — userId is not stored when anonymous=true.
   */
  async createFeedback(userId: string, dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        userId: dto.anonymous ? null : userId, // Anonymous submissions have no userId
        category: dto.category,
        content: dto.content,
        status: 'NEW',
      },
    });
  }

  // ── GET /feedback ──────────────────────────────────
  /**
   * List feedback. Admins see all; regular users see only their own (non-anonymous) submissions.
   */
  async listFeedback(
    userId: string,
    hasGlobalPerm: boolean,
    query: { status?: string; category?: string; page?: number; limit?: number },
  ) {
    const { page = 1, limit = 20, status, category } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (!hasGlobalPerm) where.userId = userId;
    if (status) where.status = status;
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, registrationNumber: true, profile: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    // Hide submitter identity from non-admin users when viewing others' feedback
    return {
      items: items.map(f => ({
        ...f,
        user: hasGlobalPerm ? f.user : undefined, // Non-admins don't see user info
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── PATCH /feedback/:id ────────────────────────────
  /**
   * Admin responds to or updates the status of a feedback item.
   */
  async updateFeedback(id: string, userId: string, hasGlobalPerm: boolean, dto: UpdateFeedbackDto) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');

    // Only admins can update feedback
    if (!hasGlobalPerm) throw new ForbiddenException('Only admins can respond to feedback');

    return this.prisma.feedback.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.adminResponse && { adminResponse: dto.adminResponse }),
      },
    });
  }
}
