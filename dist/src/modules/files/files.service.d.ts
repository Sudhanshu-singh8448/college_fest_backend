import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
export declare class FilesService {
    private readonly prisma;
    private readonly config;
    private readonly s3;
    private readonly bucket;
    private readonly region;
    constructor(prisma: PrismaService, config: ConfigService);
    requestUploadUrl(userId: string, dto: RequestUploadUrlDto): Promise<{
        fileId: string;
        uploadUrl: string;
        key: string;
        expiresAt: Date;
    }>;
    confirmUpload(userId: string, dto: ConfirmUploadDto): Promise<{
        url: string;
        type: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        size: number;
        uploaderId: string;
    }>;
    getDownloadUrl(id: string, userId: string): Promise<{
        fileId: string;
        url: string;
        downloadUrl: string;
        expiresAt: Date;
    }>;
    private publicBaseUrl;
    private extensionFromMime;
}
