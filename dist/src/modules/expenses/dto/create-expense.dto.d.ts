export declare class CreateExpenseDto {
    categoryId: string;
    eventId?: string;
    amount: number;
    description: string;
    receiptFileId?: string;
    receiptUrl?: string;
    submit?: boolean;
}
