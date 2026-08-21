export declare class WinnerEntryDto {
    userId: string;
    position: number;
    prize?: string;
    note?: string;
}
export declare class SetEventWinnersDto {
    winners: WinnerEntryDto[];
}
