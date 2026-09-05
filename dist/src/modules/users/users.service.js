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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                roles: { include: { role: true } },
                userXp: true,
                userBadges: { include: { badge: true } },
                userStreaks: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
    async updateMyProfile(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                profile: {
                    upsert: {
                        create: {
                            firstName: dto.firstName || '',
                            lastName: dto.lastName || '',
                            bio: dto.bio,
                            avatarUrl: dto.avatarUrl,
                            phone: dto.phone,
                        },
                        update: {
                            ...(dto.firstName !== undefined && { firstName: dto.firstName }),
                            ...(dto.lastName !== undefined && { lastName: dto.lastName }),
                            ...(dto.bio !== undefined && { bio: dto.bio }),
                            ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
                            ...(dto.phone !== undefined && { phone: dto.phone }),
                        },
                    },
                },
            },
            include: { profile: true },
        });
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
    async softDeleteUser(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                status: 'SUSPENDED',
                deletedAt: new Date(),
            },
        });
        return { message: 'Account deactivated' };
    }
    async searchUsers(query, pagination) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        const where = query
            ? {
                OR: [
                    {
                        registrationNumber: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    { email: { contains: query, mode: 'insensitive' } },
                    {
                        profile: {
                            firstName: { contains: query, mode: 'insensitive' },
                        },
                    },
                    {
                        profile: {
                            lastName: { contains: query, mode: 'insensitive' },
                        },
                    },
                ],
                deletedAt: null,
            }
            : { deletedAt: null };
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: { profile: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            items: users.map(({ passwordHash, ...u }) => u),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                roles: { include: { role: true } },
                userXp: true,
                userBadges: { include: { badge: true } },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
    async updateUserStatus(id, status) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id },
            data: { status },
        });
        return { message: `User status updated to ${status}` };
    }
    async getUserRoles(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: { include: { permission: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user.roles.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            description: ur.role.description,
            permissions: ur.role.permissions.map((rp) => rp.permission.action),
        }));
    }
    async assignRole(userId, roleName) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const role = await this.prisma.role.findUnique({
            where: { name: roleName },
        });
        if (!role)
            throw new common_1.NotFoundException(`Role "${roleName}" not found`);
        const existing = await this.prisma.userRole.findUnique({
            where: { userId_roleId: { userId, roleId: role.id } },
        });
        if (existing) {
            throw new common_1.ConflictException(`User already has role "${roleName}"`);
        }
        await this.prisma.userRole.create({
            data: { userId, roleId: role.id },
        });
        return { message: `Role "${roleName}" assigned successfully` };
    }
    async removeRole(userId, roleId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const existing = await this.prisma.userRole.findUnique({
            where: { userId_roleId: { userId, roleId } },
        });
        if (!existing) {
            throw new common_1.NotFoundException('User does not have this role');
        }
        await this.prisma.userRole.delete({
            where: { userId_roleId: { userId, roleId } },
        });
        return { message: 'Role removed successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map