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
var NotificationsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../notifications.service");
const resend_1 = require("resend");
const config_1 = require("@nestjs/config");
let NotificationsProcessor = NotificationsProcessor_1 = class NotificationsProcessor extends bullmq_1.WorkerHost {
    notificationsService;
    configService;
    logger = new common_1.Logger(NotificationsProcessor_1.name);
    resend;
    emailFrom;
    constructor(notificationsService, configService) {
        super();
        this.notificationsService = notificationsService;
        this.configService = configService;
        const resendKey = configService.get('RESEND_API_KEY');
        this.resend = resendKey ? new resend_1.Resend(resendKey) : null;
        this.emailFrom = configService.get('EMAIL_FROM', 'TechGram <no-reply@techgram.app>');
    }
    async process(job) {
        const payload = job.data;
        this.logger.debug(`Processing notification [${payload.type}] for user ${payload.userId}`);
        try {
            await this.notificationsService.createInAppNotification(payload);
            const prefs = await this.notificationsService.getPreferenceForType(payload.userId, payload.type);
            if (prefs.pushEnabled) {
                await this.notificationsService.sendFcmPush(payload.userId, payload.title, payload.body, payload.data);
            }
            const emailTypes = [
                'REGISTRATION_APPROVED',
                'REGISTRATION_REJECTED',
                'ANNOUNCEMENT',
            ];
            if (prefs.emailEnabled &&
                emailTypes.includes(payload.type) &&
                this.resend) {
                await this.sendEmail(payload);
            }
        }
        catch (error) {
            this.logger.error(`Notification processing failed for job ${job.id}:`, error);
            throw error;
        }
    }
    async sendEmail(payload) {
        if (!this.resend)
            return;
        const recipientEmail = payload.data?.['email'];
        if (!recipientEmail)
            return;
        try {
            await this.resend.emails.send({
                from: this.emailFrom,
                to: [recipientEmail],
                subject: payload.title,
                html: this.buildEmailHtml(payload),
            });
            this.logger.log(`Email sent to ${recipientEmail} for [${payload.type}]`);
        }
        catch (e) {
            this.logger.error('Email send failed:', e);
        }
    }
    buildEmailHtml(payload) {
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
};
exports.NotificationsProcessor = NotificationsProcessor;
exports.NotificationsProcessor = NotificationsProcessor = NotificationsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        config_1.ConfigService])
], NotificationsProcessor);
//# sourceMappingURL=notifications.processor.js.map