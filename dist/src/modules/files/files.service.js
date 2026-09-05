"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const request_upload_url_dto_1 = require("./dto/request-upload-url.dto");
let FilesService = class FilesService {
    prisma;
    config;
    s3;
    bucket;
    region;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.region = config.get('storage.region', 'auto');
        this.bucket = config.get('storage.bucket', 'techgram-uploads');
        this.s3 = new client_s3_1.S3Client({
            region: this.region,
            endpoint: config.get('storage.endpoint'),
            credentials: {
                accessKeyId: config.get('storage.accessKeyId', ''),
                secretAccessKey: config.get('storage.secretAccessKey', ''),
            },
            forcePathStyle: !!config.get('storage.endpoint'),
        });
    }
    async requestUploadUrl(userId, dto) {
        const limitMb = request_upload_url_dto_1.UPLOAD_LIMITS_MB[dto.purpose];
        const limitBytes = limitMb * 1024 * 1024;
        if (dto.size > limitBytes) {
            throw new common_1.BadRequestException(`File size ${(dto.size / 1024 / 1024).toFixed(1)} MB exceeds limit of ${limitMb} MB for purpose "${dto.purpose}"`);
        }
        const ext = this.extensionFromMime(dto.contentType);
        const key = `${dto.purpose}/${userId}/${(0, uuid_1.v4)()}${ext}`;
        const file = await this.prisma.file.create({
            data: {
                uploaderId: userId,
                url: `${this.publicBaseUrl()}/${key}`,
                key,
                type: dto.contentType,
                size: dto.size,
                status: 'PENDING',
            },
        });
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: dto.contentType,
            ContentLength: dto.size,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: 600 });
        return {
            fileId: file.id,
            uploadUrl,
            key,
            expiresAt: new Date(Date.now() + 600_000),
        };
    }
    async confirmUpload(userId, dto) {
        const file = await this.prisma.file.findUnique({
            where: { id: dto.fileId },
        });
        if (!file)
            throw new common_1.NotFoundException('File record not found');
        if (file.uploaderId !== userId)
            throw new common_1.ForbiddenException('You did not initiate this upload');
        if (file.status === 'CONFIRMED')
            return file;
        try {
            await this.s3.send(new client_s3_1.HeadObjectCommand({ Bucket: this.bucket, Key: file.key }));
        }
        catch {
            throw new common_1.BadRequestException('File not found in storage. Upload may have failed — please try again.');
        }
        return this.prisma.file.update({
            where: { id: file.id },
            data: { status: 'CONFIRMED' },
        });
    }
    async getDownloadUrl(id, userId) {
        const file = await this.prisma.file.findUnique({ where: { id } });
        if (!file)
            throw new common_1.NotFoundException('File not found');
        if (file.status !== 'CONFIRMED')
            throw new common_1.BadRequestException('File upload is not complete');
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: file.key,
        });
        const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, {
            expiresIn: 300,
        });
        return {
            fileId: file.id,
            url: file.url,
            downloadUrl,
            expiresAt: new Date(Date.now() + 300_000),
        };
    }
    publicBaseUrl() {
        return this.config.get('storage.publicBaseUrl', `https://${this.bucket}.s3.amazonaws.com`);
    }
    extensionFromMime(mimeType) {
        const map = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/gif': '.gif',
            'video/mp4': '.mp4',
            'video/webm': '.webm',
            'application/pdf': '.pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        };
        return map[mimeType] ?? '';
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map