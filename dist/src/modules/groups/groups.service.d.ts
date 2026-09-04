import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMyGroups(userId: string): Promise<{
        memberCount: number;
        joinedAt: Date;
        _count: {
            members: number;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        autoAssignRule: Prisma.JsonValue | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        memberCount: number;
        _count: {
            members: number;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        autoAssignRule: Prisma.JsonValue | null;
    }>;
    create(dto: CreateGroupDto, creatorId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        autoAssignRule: Prisma.JsonValue | null;
    }>;
    update(id: string, dto: UpdateGroupDto, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        autoAssignRule: Prisma.JsonValue | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getMembers(groupId: string, userId: string): Promise<({
        user: {
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            registrationNumber: string;
            email: string | null;
            passwordHash: string;
            status: string;
            deletedAt: Date | null;
        };
    } & {
        userId: string;
        joinedAt: Date;
        groupId: string;
    })[]>;
    addMember(groupId: string, targetUserId: string, actorId: string): Promise<{
        message: string;
    }>;
    removeMember(groupId: string, targetUserId: string, actorId: string): Promise<{
        message: string;
    }>;
    autoAssignGroups(userId: string, registrationNumber: string): Promise<void>;
    private assertMembership;
}
