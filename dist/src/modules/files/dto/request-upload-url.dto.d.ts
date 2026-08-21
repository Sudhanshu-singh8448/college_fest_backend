export type UploadPurpose = 'avatar' | 'event_banner' | 'chat_image' | 'chat_video' | 'document' | 'receipt';
export declare const UPLOAD_LIMITS_MB: Record<UploadPurpose, number>;
export declare class RequestUploadUrlDto {
    purpose: UploadPurpose;
    contentType: string;
    size: number;
    fileName?: string;
}
