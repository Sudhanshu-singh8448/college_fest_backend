import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseStatusDto } from './dto/update-expense-status.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(dto: CreateExpenseDto, user: any): Promise<{
        event: {
            id: string;
            name: string;
        } | null;
        category: {
            id: string;
            name: string;
            createdAt: Date;
        };
        submitter: {
            id: string;
            registrationNumber: string;
            profile: {
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
                userId: string;
            } | null;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string | null;
        categoryId: string;
        amount: number;
        receiptUrl: string | null;
        submitterId: string;
    }>;
    listCategories(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
    }[]>;
    getReports(user: any): Promise<{
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
    exportExpenses(user: any): Promise<{
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
    list(query: ExpenseQueryDto, user: any): Promise<{
        items: ({
            event: {
                id: string;
                name: string;
            } | null;
            category: {
                id: string;
                name: string;
                createdAt: Date;
            };
            submitter: {
                id: string;
                registrationNumber: string;
                profile: {
                    firstName: string;
                    lastName: string;
                } | null;
            };
        } & {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
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
    getById(id: string, user: any): Promise<{
        event: {
            id: string;
            name: string;
        } | null;
        category: {
            id: string;
            name: string;
            createdAt: Date;
        };
        submitter: {
            id: string;
            registrationNumber: string;
            profile: {
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
                userId: string;
            } | null;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string | null;
        categoryId: string;
        amount: number;
        receiptUrl: string | null;
        submitterId: string;
    }>;
    updateStatus(id: string, dto: UpdateExpenseStatusDto, user: any): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
        };
        submitter: {
            id: string;
            registrationNumber: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string | null;
        categoryId: string;
        amount: number;
        receiptUrl: string | null;
        submitterId: string;
    }>;
}
