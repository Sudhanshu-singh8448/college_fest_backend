export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    FILE = "FILE"
}
export declare class SendMessageDto {
    content: string;
    type?: MessageType;
    replyToId?: string;
    attachments?: {
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }[];
}
