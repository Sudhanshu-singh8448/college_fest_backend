import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { AddOrganizerDto } from './dto/add-organizer.dto';
import { EventQueryDto } from './dto/event-query.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findAll(query: EventQueryDto): Promise<{
        items: ({
            fest: {
                name: string;
                id: string;
                year: number;
            };
            _count: {
                registrations: number;
            };
        } & {
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
            };
            role: string;
            userId: string;
            eventId: string;
        }[];
        fest: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            year: number;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            guidelines: string | null;
        };
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
    }>;
    create(dto: CreateEventDto, user: any): Promise<{
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
    }>;
    update(id: string, dto: UpdateEventDto, user: any): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    updateStatus(id: string, dto: UpdateEventStatusDto, user: any): Promise<{
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
    }>;
    getOrganizers(id: string, user: any): Promise<{
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
            id: string;
            registrationNumber: string;
            email: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
        role: string;
        userId: string;
        eventId: string;
    }[]>;
    addOrganizer(id: string, dto: AddOrganizerDto, user: any): Promise<{
        message: string;
    }>;
    removeOrganizer(id: string, targetUserId: string, user: any): Promise<{
        message: string;
    }>;
    getStats(id: string, user: any): Promise<{
        totalRegistrations: number;
        statusBreakdown: {
            status: string;
            count: number;
        }[];
        checkedIn: number;
    }>;
}
