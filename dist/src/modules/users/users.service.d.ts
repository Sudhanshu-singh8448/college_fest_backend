import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        profile: {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            bio: string | null;
            phone: string | null;
            collegeId: string | null;
            branchId: string | null;
            batchId: string | null;
        } | null;
        userXp: {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            totalXp: number;
            level: number;
        } | null;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        userBadges: ({
            badge: {
                description: string;
                name: string;
                id: string;
                createdAt: Date;
                iconUrl: string;
                condition: string;
                xpReward: number;
            };
        } & {
            userId: string;
            id: string;
            badgeId: string;
            earnedAt: Date;
        })[];
        userStreaks: {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currentStreak: number;
            longestStreak: number;
            freezes: number;
            lastCheckIn: Date | null;
        }[];
        id: string;
        registrationNumber: string;
        email: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    updateMyProfile(userId: string, dto: UpdateProfileDto): Promise<{
        profile: {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            bio: string | null;
            phone: string | null;
            collegeId: string | null;
            branchId: string | null;
            batchId: string | null;
        } | null;
        id: string;
        registrationNumber: string;
        email: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    softDeleteUser(userId: string): Promise<{
        message: string;
    }>;
    searchUsers(query: string, pagination: PaginationDto): Promise<{
        items: {
            profile: {
                userId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                bio: string | null;
                phone: string | null;
                collegeId: string | null;
                branchId: string | null;
                batchId: string | null;
            } | null;
            id: string;
            registrationNumber: string;
            email: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserById(id: string): Promise<{
        profile: {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            bio: string | null;
            phone: string | null;
            collegeId: string | null;
            branchId: string | null;
            batchId: string | null;
        } | null;
        userXp: {
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            totalXp: number;
            level: number;
        } | null;
        roles: ({
            role: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
        userBadges: ({
            badge: {
                description: string;
                name: string;
                id: string;
                createdAt: Date;
                iconUrl: string;
                condition: string;
                xpReward: number;
            };
        } & {
            userId: string;
            id: string;
            badgeId: string;
            earnedAt: Date;
        })[];
        id: string;
        registrationNumber: string;
        email: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    updateUserStatus(id: string, status: string): Promise<{
        message: string;
    }>;
    getUserRoles(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        permissions: string[];
    }[]>;
    assignRole(userId: string, roleName: string): Promise<{
        message: string;
    }>;
    removeRole(userId: string, roleId: string): Promise<{
        message: string;
    }>;
}
