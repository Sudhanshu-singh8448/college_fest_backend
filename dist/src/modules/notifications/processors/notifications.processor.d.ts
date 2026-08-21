import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationsService, SendNotificationPayload } from '../notifications.service';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsProcessor extends WorkerHost {
    private readonly notificationsService;
    private readonly configService;
    private readonly logger;
    private readonly resend;
    private readonly emailFrom;
    constructor(notificationsService: NotificationsService, configService: ConfigService);
    process(job: Job<SendNotificationPayload>): Promise<void>;
    private sendEmail;
    private buildEmailHtml;
}
