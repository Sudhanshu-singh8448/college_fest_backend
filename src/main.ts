import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  // CORS — platform-agnostic, allow any client
  const corsOrigins = configService.get<string[]>('app.cors.origins') || ['*'];
  app.enableCors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger API docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TechGram API')
    .setDescription('TechGram College Fest Backend — Platform Agnostic REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  console.log(`🚀 TechGram API running on http://localhost:${port}`);
  console.log(`📝 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
