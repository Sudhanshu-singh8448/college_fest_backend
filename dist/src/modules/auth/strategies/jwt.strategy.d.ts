import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
    }): Promise<{
        roles: string[];
        permissions: string[];
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
        passwordHash: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
export {};
