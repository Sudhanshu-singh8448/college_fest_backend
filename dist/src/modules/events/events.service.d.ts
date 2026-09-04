import { PrismaService } from '../../database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: EventQueryDto): Promise<{
        items: ({
            fest: {
                id: string;
                name: string;
                year: number;
            };
            _count: {
                registrations: number;
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        organizers: {
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
                id: string;
                createdAt: Date;
                updatedAt: Date;
                registrationNumber: string;
                email: string | null;
                status: string;
                deletedAt: Date | null;
            };
            role: string;
            userId: string;
            eventId: string;
        }[];
        fest: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            guidelines: string | null;
        };
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
    }>;
    create(dto: CreateEventDto, creatorId: string): Promise<{
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
    }>;
    update(id: string, dto: UpdateEventDto, userId: string, hasGlobalPerm: boolean): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    updateStatus(id: string, status: string, userId: string, hasGlobalPerm: boolean): Promise<{
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
    }>;
    getOrganizers(id: string, userId: string, hasGlobalPerm: boolean): Promise<{
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            registrationNumber: string;
            email: string | null;
            status: string;
            deletedAt: Date | null;
        };
        role: string;
        userId: string;
        eventId: string;
    }[]>;
    addOrganizer(id: string, targetUserId: string, role: string, actorId: string, hasGlobalPerm: boolean): Promise<{
        message: string;
    }>;
    removeOrganizer(id: string, targetUserId: string, actorId: string, hasGlobalPerm: boolean): Promise<{
        message: string;
    }>;
    getStats(id: string, userId: string, hasGlobalPerm: boolean): Promise<{
        totalRegistrations: number;
        statusBreakdown: {
            status: string;
            count: number;
        }[];
        checkedIn: number;
    }>;
    private assertEventExists;
    private assertOrganizer;
}
