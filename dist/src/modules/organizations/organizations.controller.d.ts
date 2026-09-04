import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SetRegFormatDto } from './dto/set-reg-format.dto';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    findAll(): Promise<({
        colleges: ({
            branches: {
                id: string;
                name: string;
                createdAt: Date;
                collegeId: string;
                code: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            organizationId: string;
            code: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
    })[]>;
    findOne(id: string): Promise<{
        colleges: ({
            branches: {
                id: string;
                name: string;
                createdAt: Date;
                collegeId: string;
                code: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            organizationId: string;
            code: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
    }>;
    create(dto: CreateOrganizationDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
    }>;
    update(id: string, dto: UpdateOrganizationDto): Promise<{
        id: string;
        name: string;
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
