import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import {
  RequestUploadUrlDto,
  UPLOAD_LIMITS_MB,
} from './dto/request-upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@Injectable()
export class FilesService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.region = config.get<string>('storage.region', 'auto');
    this.bucket = config.get<string>('storage.bucket', 'techgram-uploads');

    this.s3 = new S3Client({
      region: this.region,
      // Cloudflare R2 or AWS S3 endpoint
      endpoint: config.get<string>('storage.endpoint'),
      credentials: {
        accessKeyId: config.get<string>('storage.accessKeyId', ''),
        secretAccessKey: config.get<string>('storage.secretAccessKey', ''),
      },
      forcePathStyle: !!config.get<string>('storage.endpoint'), // Required for R2 / MinIO
    });
  }

  // ── POST /files/upload-url ─────────────────────────
  /**
   * Generate a pre-signed S3/R2 PUT URL.
   * Client uploads directly — backend never proxies the binary data.
   */
  async requestUploadUrl(userId: string, dto: RequestUploadUrlDto) {
    // 1. Validate file size limit for this purpose
    const limitMb = UPLOAD_LIMITS_MB[dto.purpose];
    const limitBytes = limitMb * 1024 * 1024;
    if (dto.size > limitBytes) {
      throw new BadRequestException(
        `File size ${(dto.size / 1024 / 1024).toFixed(1)} MB exceeds limit of ${limitMb} MB for purpose "${dto.purpose}"`,
      );
    }

    // 2. Build a deterministic, collision-resistant key
    const ext = this.extensionFromMime(dto.contentType);
    const key = `${dto.purpose}/${userId}/${uuidv4()}${ext}`;

    // 3. Create a PENDING file record in DB (status confirmed after client signals completion)
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

    // 4. Generate pre-signed PUT URL (expires in 10 minutes)
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
      ContentLength: dto.size,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 600 });

    return {
      fileId: file.id,
      uploadUrl,
      key,
      expiresAt: new Date(Date.now() + 600_000),
    };
  }

  // ── POST /files/confirm ────────────────────────────
  /**
   * Client calls this after successfully uploading to S3.
   * Backend verifies the object exists in the bucket, then marks the file CONFIRMED.
   */
  async confirmUpload(userId: string, dto: ConfirmUploadDto) {
    const file = await this.prisma.file.findUnique({
      where: { id: dto.fileId },
    });
    if (!file) throw new NotFoundException('File record not found');
    if (file.uploaderId !== userId)
      throw new ForbiddenException('You did not initiate this upload');
    if (file.status === 'CONFIRMED') return file; // Idempotent

    // Verify object actually exists in storage
    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: file.key }),
      );
    } catch {
      throw new BadRequestException(
        'File not found in storage. Upload may have failed — please try again.',
      );
    }

    return this.prisma.file.update({
      where: { id: file.id },
      data: { status: 'CONFIRMED' },
    });
  }

  // ── GET /files/:id/download-url ────────────────────
  /**
   * Generate a short-lived signed GET URL for downloading a private file.
   */
  async getDownloadUrl(id: string, userId: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    if (file.status !== 'CONFIRMED')
      throw new BadRequestException('File upload is not complete');

    // Allow uploader OR any authenticated user (adjust per access policy)
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: file.key,
    });
    const downloadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    }); // 5 min

    return {
      fileId: file.id,
      url: file.url,
      downloadUrl,
      expiresAt: new Date(Date.now() + 300_000),
    };
  }

  // ─────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────

  private publicBaseUrl(): string {
    return this.config.get<string>(
      'storage.publicBaseUrl',
      `https://${this.bucket}.s3.amazonaws.com`,
    );
  }

  private extensionFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '.docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        '.xlsx',
    };
    return map[mimeType] ?? '';
  }
}
