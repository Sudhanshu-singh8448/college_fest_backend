"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let FeedbackService = class FeedbackService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createFeedback(userId, dto) {
        return this.prisma.feedback.create({
            data: {
                userId: dto.anonymous ? null : userId,
                category: dto.category,
                content: dto.content,
                status: 'NEW',
            },
        });
    }
    async listFeedback(userId, hasGlobalPerm, query) {
        const { page = 1, limit = 20, status, category } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (!hasGlobalPerm)
            where.userId = userId;
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        const [items, total] = await Promise.all([
            this.prisma.feedback.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            registrationNumber: true,
                            profile: { select: { firstName: true, lastName: true } },
                        },
                    },
                },
            }),
            this.prisma.feedback.count({ where }),
        ]);
        return {
            items: items.map((f) => ({
                ...f,
                user: hasGlobalPerm ? f.user : undefined,
            })),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async updateFeedback(id, userId, hasGlobalPerm, dto) {
        const feedback = await this.prisma.feedback.findUnique({ where: { id } });
        if (!feedback)
            throw new common_1.NotFoundException('Feedback not found');
        if (!hasGlobalPerm)
            throw new common_1.ForbiddenException('Only admins can respond to feedback');
        return this.prisma.feedback.update({
            where: { id },
            data: {
                ...(dto.status && { status: dto.status }),
                ...(dto.adminResponse && { adminResponse: dto.adminResponse }),
            },
        });
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map