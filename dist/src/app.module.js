"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const chat_module_1 = require("./modules/chat/chat.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const config_2 = require("./config");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const groups_module_1 = require("./modules/groups/groups.module");
const fest_module_1 = require("./modules/fest/fest.module");
const events_module_1 = require("./modules/events/events.module");
const forms_module_1 = require("./modules/forms/forms.module");
const registrations_module_1 = require("./modules/registrations/registrations.module");
const workflow_module_1 = require("./modules/workflow/workflow.module");
const ticketing_module_1 = require("./modules/ticketing/ticketing.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const files_module_1 = require("./modules/files/files.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const feedback_module_1 = require("./modules/feedback/feedback.module");
const gamification_module_1 = require("./modules/gamification/gamification.module");
const admin_module_1 = require("./modules/admin/admin.module");
const audit_module_1 = require("./modules/audit/audit.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.databaseConfig, config_2.redisConfig, config_2.jwtConfig, config_2.storageConfig, config_2.appConfig],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 10,
                },
                {
                    name: 'medium',
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    connection: {
                        host: config.get('redis.host', 'localhost'),
                        port: config.get('redis.port', 6379),
                        password: config.get('redis.password'),
                    },
                }),
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            groups_module_1.GroupsModule,
            fest_module_1.FestModule,
            events_module_1.EventsModule,
            forms_module_1.FormsModule,
            registrations_module_1.RegistrationsModule,
            workflow_module_1.WorkflowModule,
            ticketing_module_1.TicketingModule,
            attendance_module_1.AttendanceModule,
            chat_module_1.ChatModule,
            event_emitter_1.EventEmitterModule.forRoot({ wildcard: true }),
            notifications_module_1.NotificationsModule,
            files_module_1.FilesModule,
            expenses_module_1.ExpensesModule,
            feedback_module_1.FeedbackModule,
            gamification_module_1.GamificationModule,
            admin_module_1.AdminModule,
            audit_module_1.AuditModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map