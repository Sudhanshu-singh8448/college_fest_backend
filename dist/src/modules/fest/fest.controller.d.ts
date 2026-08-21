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
    updateGuidelines(id: string, dto: UpdateGuidelinesDto): Promise<{
        name: string;
        id: string;
        guidelines: string | null;
    }>;
}
