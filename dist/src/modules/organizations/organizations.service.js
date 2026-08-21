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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let OrganizationsService = class OrganizationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.organization.findMany({
            include: {
                colleges: {
                    include: {
                        branches: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const org = await this.prisma.organization.findUnique({
            where: { id },
            include: {
                colleges: {
                    include: {
                        branches: true,
                    },
                },
            },
        });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return org;
    }
    async create(dto) {
        return this.prisma.organization.create({
            data: {
                name: dto.name,
                domain: dto.domain,
            },
        });
    }
    async update(id, dto) {
        const org = await this.prisma.organization.findUnique({ where: { id } });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return this.prisma.organization.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.domain !== undefined && { domain: dto.domain }),
            },
        });
    }
    async setRegFormat(id, dto) {
        const org = await this.prisma.organization.findUnique({ where: { id } });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        try {
            new RegExp(dto.regex);
        }
        catch {
            throw new common_1.NotFoundException('Invalid regex pattern');
        }
        return this.prisma.registrationNumberFormat.create({
            data: {
                regex: dto.regex,
                formatMap: dto.formatMap,
            },
        });
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map