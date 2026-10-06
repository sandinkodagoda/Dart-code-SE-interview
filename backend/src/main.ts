import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 5000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const frontendUrl = configService.get<string>('app.frontendUrl', 'http://localhost:3000');
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  // Ensure uploads directory exists
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static assets from uploads directory
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  // Security headers with Helmet (configured to allow cross-origin image loads)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Global prefix (e.g. /api/v1)
  app.setGlobalPrefix(apiPrefix);

  // Controlled CORS
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Response Envelope Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Electronics & Tech Gadgets E-Commerce API')
    .setDescription(
      'Modular Monolith backend for Electronics & Gadgets E-Commerce Store technical assessment.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT Admin Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'API health and status check')
    .addTag('Authentication', 'Admin authentication and login')
    .addTag('Categories', 'Product category management')
    .addTag('Brands', 'Product brand management')
    .addTag('Products', 'Product catalog, search, and inventory management')
    .addTag('Orders', 'Order processing and checkout')
    .addTag('Payments', 'PayHere payment processing and webhook callbacks')
    .addTag('WhatsApp', 'WhatsApp order message generation')
    .addTag('Dashboard', 'Admin overview metrics')
    .addTag('Audit Logs', 'Administrative action auditing and compliance logs')
    .addTag('Admin', 'Administrative operations across catalog, orders, and system')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Nexora API Docs',
  });

  await app.listen(port);
  logger.log(`Application running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/docs`);
}

bootstrap();
