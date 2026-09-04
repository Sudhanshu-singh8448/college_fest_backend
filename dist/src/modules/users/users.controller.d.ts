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
    updateMyProfile(user: any, dto: UpdateProfileDto): Promise<{
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
    deleteAccount(user: any): Promise<{
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
