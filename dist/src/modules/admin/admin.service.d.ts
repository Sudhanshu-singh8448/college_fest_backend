import { PrismaService } from '../../database/prisma.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateRegNumberFormatDto } from './dto/update-reg-format.dto';
import { SetEventWinnersDto } from './dto/set-event-winners.dto';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<{
        users: {
            total: number;
            activeLast7d: number;
            newThisWeek: number;
        };
        events: {
            total: number;
            byStatus: {
                [k: string]: number;
            };
            totalRegistrations: number;
            pendingRegistrations: number;
        };
        finance: {
            approvedExpensesCount: number;
            pendingApprovalCount: number;
            totalApprovedSpend: number;
        };
        feedback: {
            [k: string]: number;
        };
        leaderboard: {
            rank: number;
            totalXp: number;
            level: number;
            user: {
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
                id: string;
                registrationNumber: string;
            };
        }[];
        generatedAt: Date;
    }>;
    getUserStats(query: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        users: {
            profile: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                phone: string | null;
            } | null;
            userXp: {
                totalXp: number;
                level: number;
            } | null;
            id: string;
            registrationNumber: string;
            email: string | null;
            status: string;
            createdAt: Date;
            roles: {
                role: {
                    name: string;
                };
            }[];
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        stats: {
            byStatus: {
                [k: string]: number;
            };
            newThisMonth: number;
        };
    }>;
    getEventStats(): Promise<{
        events: {
            id: string;
            name: string;
            status: string;
            category: string;
            startDate: Date;
            maxParticipants: number | null;
            registrationCount: number;
            attendanceCount: number;
            fillRate: number | null;
            attendanceRate: number;
        }[];
        summary: {
            total: number;
            byCategory: {
                [k: string]: number;
            };
            byStatus: {
                [k: string]: number;
            };
            avgFillRate: number;
        };
    }>;
    getFinanceStats(): Promise<{
        byStatus: {
            status: string;
            total: number;
            count: number;
        }[];
        byCategory: {
            categoryId: string;
            categoryName: string;
            total: number;
            count: number;
        }[];
        topEventsBySpend: {
            eventId: string | null;
            total: number;
            count: number;
        }[];
        pendingApprovals: ({
            event: {
                name: string;
                id: string;
            } | null;
            category: {
                name: string;
                id: string;
                createdAt: Date;
            };
            submitter: {
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
                registrationNumber: string;
            };
        } & {
            description: string;
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            eventId: string | null;
            categoryId: string;
            amount: number;
            receiptUrl: string | null;
            submitterId: string;
        })[];
    }>;
    getAuditLogs(query: AuditLogQueryDto): Promise<{
        items: ({
            actor: {
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
                id: string;
                registrationNumber: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            action: string;
            actorId: string | null;
            resourceType: string;
            resourceId: string | null;
            oldValue: import("@prisma/client/runtime/client").JsonValue | null;
            newValue: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getSettings(): Promise<{
        settings: {
            [k: string]: string;
        };
        updatedAt: Date;
    }>;
    updateSettings(dto: UpdateSettingsDto): Promise<{
        settings: {
            [k: string]: string;
        };
        updatedAt: Date;
    }>;
    updateRegNumberFormat(dto: UpdateRegNumberFormatDto): Promise<{
        format: string;
        prefix: string;
        preview: string;
    }>;
    getEventWinners(eventId: string): Promise<{
        event: {
            name: string;
            id: string;
        };
        winners: ({
            user: {
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
                id: string;
                registrationNumber: string;
            };
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            eventId: string;
            position: number;
            prize: string | null;
            note: string | null;
            recordedById: string;
        })[];
    }>;
    setEventWinners(eventId: string, recordedById: string, dto: SetEventWinnersDto): Promise<{
        event: {
            name: string;
            id: string;
        };
        winners: ({
            user: {
                profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                } | null;
                id: string;
                registrationNumber: string;
            };
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            eventId: string;
            position: number;
            prize: string | null;
            note: string | null;
            recordedById: string;
        })[];
    }>;
    exportData(type: string): Promise<{
        profile: {
            firstName: string;
            lastName: string;
            phone: string | null;
        } | null;
        id: string;
        registrationNumber: string;
        email: string | null;
        status: string;
        createdAt: Date;
        roles: {
            role: {
                name: string;
            };
        }[];
    }[] | ({
        fest: {
            name: string;
        };
        _count: {
            attendances: number;
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
    })[] | ({
        user: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
            registrationNumber: string;
        };
        event: {
            name: string;
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
    })[] | ({
        event: {
            name: string;
        } | null;
        category: {
            name: string;
            id: string;
            createdAt: Date;
        };
        submitter: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
            registrationNumber: string;
        };
    } & {
        description: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string | null;
        categoryId: string;
        amount: number;
        receiptUrl: string | null;
        submitterId: string;
    })[] | ({
        user: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
            registrationNumber: string;
        };
        event: {
            name: string;
        };
    } & {
        userId: string;
        id: string;
        eventId: string;
        scannedBy: string | null;
        scannedAt: Date;
    })[] | ({
        user: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
            registrationNumber: string;
        } | null;
    } & {
        content: string;
        userId: string | null;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        adminResponse: string | null;
    })[]>;
}
