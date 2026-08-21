import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: any): Promise<{
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
    updateMyProfile(user: any, dto: UpdateProfileDto): Promise<{
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
    deleteAccount(user: any): Promise<{
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
    updateUserStatus(id: string, dto: UpdateUserStatusDto): Promise<{
        message: string;
    }>;
    getUserRoles(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        permissions: string[];
    }[]>;
    assignRole(id: string, dto: AssignRoleDto): Promise<{
        message: string;
    }>;
    removeRole(id: string, roleId: string): Promise<{
        message: string;
    }>;
}
