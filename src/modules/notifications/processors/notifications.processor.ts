import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationsService, SendNotificationPayload } from '../notifications.service';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

/**
 * BullMQ Processor for the `notifications` queue.
 *
 * Job: `dispatch`
 * Flow:
 *   1. Create in-app notification row
 *   2. Check user preferences
 *   3. Send FCM push (if enabled)
 *   4. Send email (if enabled and type warrants it)
 *
 * Email-worthy notification types (others are in-app + push only):
 *   REGISTRATION_APPROVED, REGISTRATION_REJECTED, ANNOUNCEMENT
 */
@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private readonly resend: Resend | null;
  private readonly emailFrom: string;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {
    super();
    const resendKey = configService.get<string>('RESEND_API_KEY');
    this.resend = resendKey ? new Resend(resendKey) : null;
    this.emailFrom = configService.get<string>('EMAIL_FROM', 'TechGram <no-reply@techgram.app>');
  }

  async process(job: Job<SendNotificationPayload>) {
    const payload = job.data;
    this.logger.debug(`Processing notification [${payload.type}] for user ${payload.userId}`);

    try {
      // 1. Always: create in-app notification
      await this.notificationsService.createInAppNotification(payload);

      // 2. Get user preferences for this type
      const prefs = await this.notificationsService.getPreferenceForType(payload.userId, payload.type);

      // 3. FCM push notification
      if (prefs.pushEnabled) {
        await this.notificationsService.sendFcmPush(
          payload.userId,
          payload.title,
          payload.body,
          payload.data,
        );
      }

      // 4. Email (only for important notification types)
      const emailTypes = ['REGISTRATION_APPROVED', 'REGISTRATION_REJECTED', 'ANNOUNCEMENT'];
      if (prefs.emailEnabled && emailTypes.includes(payload.type) && this.resend) {
        await this.sendEmail(payload);
      }
    } catch (error) {
      this.logger.error(`Notification processing failed for job ${job.id}:`, error);
      throw error; // Re-throw for BullMQ retry
    }
  }

  private async sendEmail(payload: SendNotificationPayload) {
    if (!this.resend) return;

    // Get user email from prisma (we can access it through the service/prisma)
    // In a full impl, this would pull user email from prisma.
    // Simplified here — in practice, userId → email lookup before enqueueing.
    const recipientEmail = payload.data?.['email'] as string | undefined;
    if (!recipientEmail) return;

    try {
      await this.resend.emails.send({
        from: this.emailFrom,
        to: [recipientEmail],
        subject: payload.title,
        html: this.buildEmailHtml(payload),
      });
      this.logger.log(`Email sent to ${recipientEmail} for [${payload.type}]`);
    } catch (e) {
      this.logger.error('Email send failed:', e);
    }
  }

  private buildEmailHtml(payload: SendNotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">TechGram</h1>
          </div>
          <h2 style="color: #1f2937;">${payload.title}</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">${payload.body}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            You received this email based on your TechGram notification preferences.<br>
            <a href="#" style="color: #6366f1;">Manage preferences</a>
          </p>
        </body>
      </html>
    `;
  }
}
