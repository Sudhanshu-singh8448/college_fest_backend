export declare class CreateEventDto {
    festId: string;
    name: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    venue?: string;
    maxParticipants?: number;
    minTeamSize?: number;
    maxTeamSize?: number;
    isPublic?: boolean;
    bannerUrl?: string;
}
