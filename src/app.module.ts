import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ChatModule } from './modules/chat/chat.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import {
  databaseConfig,
  redisConfig,
  jwtConfig,
  storageConfig,
  appConfig,
} from './config';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { GroupsModule } from './modules/groups/groups.module';
import { FestModule } from './modules/fest/fest.module';
import { EventsModule } from './modules/events/events.module';
import { FormsModule } from './modules/forms/forms.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { TicketingModule } from './modules/ticketing/ticketing.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    // Global config from .env
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig, storageConfig, appConfig],
    }),
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    // BullMQ — global Redis connection for all queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
          password: config.get<string>('redis.password', ''),
        },
      }),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    GroupsModule,
    FestModule,
    EventsModule,
    FormsModule,
    RegistrationsModule,
    WorkflowModule,
    TicketingModule,
    AttendanceModule,
    ChatModule,
    EventEmitterModule.forRoot({ wildcard: true }),
    NotificationsModule,
    FilesModule,
    ExpensesModule,
    FeedbackModule,
    GamificationModule,
    AdminModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JwtAuthGuard globally — routes marked @Public() bypass it
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Apply ThrottlerGuard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
