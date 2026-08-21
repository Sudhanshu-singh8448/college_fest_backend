import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
export declare class RegistrationsController {
    private readonly registrationsService;
    constructor(registrationsService: RegistrationsService);
    register(eventId: string, dto: CreateRegistrationDto, user: any): Promise<{
        userId: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        submissionId: string | null;
        rejectionReason: string | null;
    }>;
    getEventRegistrations(eventId: string, user: any): Promise<({
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
    getMyRegistrations(user: any): Promise<({
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
    getRegistrationById(id: string, user: any): Promise<{
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
    updateStatus(id: string, dto: UpdateRegistrationStatusDto, user: any): Promise<{
        userId: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
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
