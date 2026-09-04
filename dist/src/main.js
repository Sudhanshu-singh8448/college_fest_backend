"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)());
    const corsOrigins = configService.get('app.cors.origins') || ['*'];
    app.enableCors({
        origin: corsOrigins.includes('*') ? true : corsOrigins,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization,Accept',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('TechGram API')
        .setDescription('TechGram College Fest Backend — Platform Agnostic REST API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = configService.get('app.port') || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 TechGram API running on http://localhost:${port}`);
    console.log(`📝 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map