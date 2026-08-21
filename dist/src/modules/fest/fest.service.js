"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const crypto = __importStar(require("crypto"));
let FestService = class FestService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.fest.findMany({
            include: {
                _count: {
                    select: {
                        registrations: true,
                        events: true,
                    },
                },
            },
            orderBy: { year: 'desc' },
        });
    }
    async findOne(id) {
        const fest = await this.prisma.fest.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        registrations: true,
                        events: true,
                    },
                },
            },
        });
        if (!fest) {
            throw new common_1.NotFoundException('Fest not found');
        }
        return fest;
    }
    async create(dto) {
        if (dto.isActive) {
            await this.prisma.fest.updateMany({
                where: { isActive: true },
                data: { isActive: false },
            });
        }
        return this.prisma.fest.create({
            data: {
                name: dto.name,
                year: dto.year,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                isActive: dto.isActive ?? false,
            },
        });
    }
    async update(id, dto) {
        const fest = await this.prisma.fest.findUnique({ where: { id } });
        if (!fest) {
            throw new common_1.NotFoundException('Fest not found');
        }
        if (dto.isActive === true) {
            await this.prisma.fest.updateMany({
                where: { isActive: true, id: { not: id } },
                data: { isActive: false },
            });
        }
        return this.prisma.fest.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.year !== undefined && { year: dto.year }),
                ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
                ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }
    async getGuidelines(id) {
        const fest = await this.prisma.fest.findUnique({
            where: { id },
            select: { id: true, name: true, guidelines: true },
        });
        if (!fest) {
            throw new common_1.NotFoundException('Fest not found');
        }
        return fest;
    }
    async updateGuidelines(id, guidelines) {
        const fest = await this.prisma.fest.findUnique({ where: { id } });
        if (!fest) {
            throw new common_1.NotFoundException('Fest not found');
        }
        return this.prisma.fest.update({
            where: { id },
            data: { guidelines },
            select: { id: true, name: true, guidelines: true },
        });
    }
    async autoRegisterForActiveFest(userId) {
        const activeFest = await this.prisma.fest.findFirst({
            where: { isActive: true },
        });
        if (!activeFest) {
            return null;
        }
        const existing = await this.prisma.festRegistration.findUnique({
            where: {
                festId_userId: { festId: activeFest.id, userId },
            },
        });
        if (existing) {
            return existing;
        }
        const registration = await this.prisma.festRegistration.create({
            data: {
                festId: activeFest.id,
                userId,
                status: 'REGISTERED',
            },
        });
        const ticketCount = await this.prisma.ticket.count({
            where: { festId: activeFest.id },
        });
        const ticketNumber = `TECHGRAM-${activeFest.year}-${String(ticketCount + 1).padStart(5, '0')}`;
        const qrSecret = crypto.randomBytes(32).toString('hex');
        await this.prisma.ticket.create({
            data: {
                ticketNumber,
                festId: activeFest.id,
                userId,
                qrSecret,
                isActive: true,
            },
        });
        return registration;
    }
    async getActiveFest() {
        return this.prisma.fest.findFirst({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        registrations: true,
                        events: true,
                    },
                },
            },
        });
    }
};
exports.FestService = FestService;
exports.FestService = FestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FestService);
//# sourceMappingURL=fest.service.js.map