import { PrismaService } from '../../database/prisma.service';
import { CreateFestDto } from './dto/create-fest.dto';
import { UpdateFestDto } from './dto/update-fest.dto';
export declare class FestService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        _count: {
            registrations: number;
            events: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        guidelines: string | null;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            registrations: number;
            events: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        guidelines: string | null;
    }>;
    create(dto: CreateFestDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        guidelines: string | null;
    }>;
    update(id: string, dto: UpdateFestDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        guidelines: string | null;
    }>;
    getGuidelines(id: string): Promise<{
        id: string;
        name: string;
        guidelines: string | null;
    }>;
    updateGuidelines(id: string, guidelines: string): Promise<{
        id: string;
        name: string;
        guidelines: string | null;
    }>;
    autoRegisterForActiveFest(userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        userId: string;
        festId: string;
    } | null>;
    getActiveFest(): Promise<({
        _count: {
            registrations: number;
            events: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        guidelines: string | null;
    }) | null>;
}
