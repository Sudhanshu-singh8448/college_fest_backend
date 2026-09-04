import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
export declare class RegistrationsController {
    private readonly registrationsService;
    constructor(registrationsService: RegistrationsService);
    register(eventId: string, dto: CreateRegistrationDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    }>;
    getEventRegistrations(eventId: string, user: any): Promise<({
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
    getMyRegistrations(user: any): Promise<({
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
    getRegistrationById(id: string, user: any): Promise<{
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
    updateStatus(id: string, dto: UpdateRegistrationStatusDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        userId: string;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    }>;
    approveAll(eventId: string, user: any): Promise<{
        message: string;
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
    exportRegistrations(eventId: string, user: any): Promise<{
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
