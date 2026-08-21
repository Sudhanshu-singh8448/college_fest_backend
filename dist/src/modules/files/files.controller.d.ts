import { FilesService } from './files.service';
import { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    requestUploadUrl(dto: RequestUploadUrlDto, user: any): Promise<{
        fileId: string;
        uploadUrl: string;
        key: string;
        expiresAt: Date;
    }>;
    confirmUpload(dto: ConfirmUploadDto, user: any): Promise<{
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
    getDownloadUrl(id: string, user: any): Promise<{
        fileId: string;
        url: string;
        downloadUrl: string;
        expiresAt: Date;
    }>;
}
