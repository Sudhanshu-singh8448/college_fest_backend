import { PrismaService } from '../../database/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SetRegFormatDto } from './dto/set-reg-format.dto';
export declare class OrganizationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        colleges: ({
            branches: {
                name: string;
                id: string;
                createdAt: Date;
                collegeId: string;
                code: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            organizationId: string;
            code: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
    })[]>;
    findOne(id: string): Promise<{
        colleges: ({
            branches: {
                name: string;
                id: string;
                createdAt: Date;
                collegeId: string;
                code: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            organizationId: string;
            code: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
    }>;
    create(dto: CreateOrganizationDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
    }>;
    update(id: string, dto: UpdateOrganizationDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
    }>;
    setRegFormat(id: string, dto: SetRegFormatDto): Promise<{
        id: string;
        createdAt: Date;
        regex: string;
        formatMap: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
