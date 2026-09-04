import { PrismaService } from '../../database/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
import { WorkflowService } from '../workflow/workflow.service';
export declare class RegistrationsService {
    private readonly prisma;
    private readonly workflowService;
    constructor(prisma: PrismaService, workflowService: WorkflowService);
    register(eventId: string, userId: string, dto: CreateRegistrationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    }>;
    getEventRegistrations(eventId: string, userId: string, hasGlobalPerm: boolean): Promise<({
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
        submission: {
            id: string;
            createdAt: Date;
            userId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            formId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    })[]>;
    getRegistrationById(id: string, userId: string, hasGlobalPerm: boolean): Promise<{
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
        event: {
            id: string;
            name: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            deletedAt: Date | null;
            startDate: Date;
            endDate: Date;
            festId: string;
            isPublic: boolean;
            category: string;
            venue: string | null;
            maxParticipants: number | null;
            minTeamSize: number;
            maxTeamSize: number;
            bannerUrl: string | null;
        };
        submission: {
            id: string;
            createdAt: Date;
            userId: string;
            answers: import("@prisma/client/runtime/client").JsonValue;
            formId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    }>;
    updateStatus(id: string, dto: UpdateRegistrationStatusDto, actorId: string, hasGlobalPerm: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    }>;
    approveAll(eventId: string, actorId: string, hasGlobalPerm: boolean): Promise<{
        message: string;
    }>;
    getMyRegistrations(userId: string): Promise<({
        event: {
            id: string;
            name: string;
            status: string;
            startDate: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    })[]>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    exportRegistrations(eventId: string, userId: string, hasGlobalPerm: boolean): Promise<{
        registrationId: string;
        status: string;
        user: {
            id: string;
            email: string | null;
            registrationNumber: string;
            firstName: string | undefined;
            lastName: string | undefined;
        };
        answers: import("@prisma/client/runtime/client").JsonValue | undefined;
        createdAt: Date;
    }[]>;
}
