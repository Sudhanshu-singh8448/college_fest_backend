export declare enum ConversationType {
    DIRECT = "DIRECT",
    GROUP = "GROUP"
}
export declare class CreateConversationDto {
    type: ConversationType;
    name?: string;
    memberIds?: string[];
}
