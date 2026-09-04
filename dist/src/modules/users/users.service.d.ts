import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        profile: {
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
            userId: string;
        } | null;
        roles: ({
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            roleId: string;
            userId: string;
        })[];
        userXp: {
            level: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            totalXp: number;
        } | null;
        userBadges: ({
            badge: {
                id: string;
                name: string;
                description: string;
                createdAt: Date;
                iconUrl: string;
                condition: string;
                xpReward: number;
            };
        } & {
            id: string;
            userId: string;
            badgeId: string;
            earnedAt: Date;
        })[];
        userStreaks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            currentStreak: number;
            longestStreak: number;
            freezes: number;
            lastCheckIn: Date | null;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationNumber: string;
        email: string | null;
        status: string;
        deletedAt: Date | null;
    }>;
    updateMyProfile(userId: string, dto: UpdateProfileDto): Promise<{
        profile: {
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
            userId: string;
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationNumber: string;
        email: string | null;
        status: string;
        deletedAt: Date | null;
    }>;
    softDeleteUser(userId: string): Promise<{
        message: string;
    }>;
    searchUsers(query: string, pagination: PaginationDto): Promise<{
        items: {
            profile: {
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
                userId: string;
            } | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            registrationNumber: string;
            email: string | null;
            status: string;
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
            userId: string;
        } | null;
        roles: ({
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            roleId: string;
            userId: string;
        })[];
        userXp: {
            level: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            totalXp: number;
        } | null;
        userBadges: ({
            badge: {
                id: string;
                name: string;
                description: string;
                createdAt: Date;
                iconUrl: string;
                condition: string;
                xpReward: number;
            };
        } & {
            id: string;
            userId: string;
            badgeId: string;
            earnedAt: Date;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationNumber: string;
        email: string | null;
        status: string;
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
