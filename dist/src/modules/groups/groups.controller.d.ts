import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    findMyGroups(user: any): Promise<{
        memberCount: number;
        joinedAt: Date;
        _count: {
            members: number;
        };
        type: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        autoAssignRule: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findOne(id: string, user: any): Promise<{
        memberCount: number;
        _count: {
            members: number;
        };
        type: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        autoAssignRule: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    create(dto: CreateGroupDto, user: any): Promise<{
        type: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        autoAssignRule: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    update(id: string, dto: UpdateGroupDto, user: any): Promise<{
        type: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        autoAssignRule: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getMembers(id: string, user: any): Promise<({
        user: {
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
        } & {
            id: string;
            registrationNumber: string;
            email: string | null;
            passwordHash: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    } & {
        userId: string;
        joinedAt: Date;
        groupId: string;
    })[]>;
    addMember(id: string, dto: AddMemberDto, user: any): Promise<{
        message: string;
    }>;
    removeMember(id: string, userId: string, user: any): Promise<{
        message: string;
    }>;
}
