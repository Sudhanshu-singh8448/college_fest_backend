import { PrismaService } from '../../database/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
import { WorkflowService } from '../workflow/workflow.service';
export declare class RegistrationsService {
    private readonly prisma;
    private readonly workflowService;
    constructor(prisma: PrismaService, workflowService: WorkflowService);
    register(eventId: string, userId: string, dto: CreateRegistrationDto): Promise<{
        userId: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    }>;
    getEventRegistrations(eventId: string, userId: string, hasGlobalPerm: boolean): Promise<({
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
        submission: {
            userId: string;
            id: string;
            createdAt: Date;
            answers: import("@prisma/client/runtime/client").JsonValue;
            formId: string;
        } | null;
    } & {
        userId: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    })[]>;
    getRegistrationById(id: string, userId: string, hasGlobalPerm: boolean): Promise<{
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
        event: {
            description: string;
            name: string;
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
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
            userId: string;
            id: string;
            createdAt: Date;
            answers: import("@prisma/client/runtime/client").JsonValue;
            formId: string;
        } | null;
    } & {
        userId: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    }>;
    updateStatus(id: string, dto: UpdateRegistrationStatusDto, actorId: string, hasGlobalPerm: boolean): Promise<{
        userId: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    }>;
    approveAll(eventId: string, actorId: string, hasGlobalPerm: boolean): Promise<{
        message: string;
    }>;
    getMyRegistrations(userId: string): Promise<({
        event: {
            name: string;
            id: string;
            status: string;
            startDate: Date;
        };
    } & {
        userId: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
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
