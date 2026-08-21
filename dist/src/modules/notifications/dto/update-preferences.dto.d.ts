export declare class UpdatePreferenceDto {
    type?: string;
    inAppEnabled?: boolean;
    pushEnabled?: boolean;
    emailEnabled?: boolean;
}
export declare class UpdatePreferencesDto {
    preferences: UpdatePreferenceDto[];
}
