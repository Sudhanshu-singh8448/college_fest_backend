import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsProcessor } from './processors/notifications.processor';
import { ScheduledJobsService } from './processors/scheduled-jobs.service';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notifications' }),
    ScheduleModule.forRoot(),
    forwardRef(() => GamificationModule), // forwardRef to avoid circular dependency
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsProcessor,
    ScheduledJobsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
