import { PrismaService } from '../../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseStatusDto } from './dto/update-expense-status.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
export declare class ExpensesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createExpense(userId: string, dto: CreateExpenseDto): Promise<{
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
    }>;
    listExpenses(userId: string, hasGlobalPerm: boolean, query: ExpenseQueryDto): Promise<{
        items: ({
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
                id: string;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    listCategories(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
    }[]>;
    getExpenseById(id: string, userId: string, hasGlobalPerm: boolean): Promise<{
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
    }>;
    updateStatus(id: string, userId: string, hasGlobalPerm: boolean, dto: UpdateExpenseStatusDto): Promise<{
        category: {
            name: string;
            id: string;
            createdAt: Date;
        };
        submitter: {
            id: string;
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
    }>;
    getReports(hasGlobalPerm: boolean, userId: string): Promise<{
        grandTotal: {
            approved: number;
            count: number;
        };
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
    }>;
    exportExpenses(hasGlobalPerm: boolean): Promise<{
        id: string;
        submitter: string;
        registrationNumber: string;
        category: string;
        event: string;
        amount: number;
        description: string;
        status: string;
        receiptUrl: string;
        createdAt: string;
    }[]>;
}
