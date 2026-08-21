import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /users/me ─────────────────────────────
  async getMe(userId: string) {
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
      throw new NotFoundException('User not found');
    }

    // Strip sensitive fields
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // ── PATCH /users/me ───────────────────────────
  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
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

  // ── DELETE /users/me ──────────────────────────
  async softDeleteUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        deletedAt: new Date(),
      },
    });
    return { message: 'Account deactivated' };
  }

  // ── GET /users (search / list) ────────────────
  async searchUsers(query: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = query
      ? {
          OR: [
            { registrationNumber: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
            { profile: { firstName: { contains: query, mode: 'insensitive' as const } } },
            { profile: { lastName: { contains: query, mode: 'insensitive' as const } } },
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

  // ── GET /users/:id ────────────────────────────
  async getUserById(id: string) {
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
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // ── PATCH /users/:id/status ───────────────────
  async updateUserStatus(id: string, status: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    return { message: `User status updated to ${status}` };
  }

  // ── GET /users/:id/roles ──────────────────────
  async getUserRoles(id: string) {
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
      throw new NotFoundException('User not found');
    }

    return user.roles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description,
      permissions: ur.role.permissions.map((rp) => rp.permission.action),
    }));
  }

  // ── POST /users/:id/roles ─────────────────────
  async assignRole(userId: string, roleName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new NotFoundException(`Role "${roleName}" not found`);

    // Check if already assigned
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId: role.id } },
    });
    if (existing) {
      throw new ConflictException(`User already has role "${roleName}"`);
    }

    await this.prisma.userRole.create({
      data: { userId, roleId: role.id },
    });

    return { message: `Role "${roleName}" assigned successfully` };
  }

  // ── DELETE /users/:id/roles/:roleId ───────────
  async removeRole(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (!existing) {
      throw new NotFoundException('User does not have this role');
    }

    await this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });

    return { message: 'Role removed successfully' };
  }
}
