import { FestService } from './fest.service';
import { CreateFestDto } from './dto/create-fest.dto';
import { UpdateFestDto } from './dto/update-fest.dto';
import { UpdateGuidelinesDto } from './dto/update-guidelines.dto';
export declare class FestController {
    private readonly festService;
    constructor(festService: FestService);
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
    updateGuidelines(id: string, dto: UpdateGuidelinesDto): Promise<{
        id: string;
        name: string;
        guidelines: string | null;
    }>;
}
