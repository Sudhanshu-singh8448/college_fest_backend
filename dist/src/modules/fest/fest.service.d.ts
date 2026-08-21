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
        name: string;
        id: string;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        guidelines: string | null;
    }>;
    create(dto: CreateFestDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        guidelines: string | null;
    }>;
    update(id: string, dto: UpdateFestDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        guidelines: string | null;
    }>;
    getGuidelines(id: string): Promise<{
        name: string;
        id: string;
        guidelines: string | null;
    }>;
    updateGuidelines(id: string, guidelines: string): Promise<{
        name: string;
        id: string;
        guidelines: string | null;
    }>;
    autoRegisterForActiveFest(userId: string): Promise<{
        userId: string;
        id: string;
        status: string;
        createdAt: Date;
        festId: string;
    } | null>;
    getActiveFest(): Promise<({
        _count: {
            registrations: number;
            events: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        guidelines: string | null;
    }) | null>;
}
