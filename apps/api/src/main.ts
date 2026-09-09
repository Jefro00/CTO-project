import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix (Section 31)
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'api/docs'],
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger OpenAPI Documentation (Section 108)
  const config = new DocumentBuilder()
    .setTitle('AUTOMOTIVE OS API')
    .setDescription(
      'Multi-tenant SaaS REST API for automotive repair shops (СТО) with Vehicle-centric history tracking, Inspections, Work Orders, Documents, and Real-time WebSockets.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Authorization')
    .addTag('organization', 'Organization Settings')
    .addTag('locations', 'Branches & Locations')
    .addTag('users', 'User Management & Location Scopes')
    .addTag('roles', 'Roles & Permissions')
    .addTag('customers', 'Customer CRM')
    .addTag('vehicles', 'Vehicle Registry & Timeline History')
    .addTag('inspections', 'Vehicle Check-in Inspections & Damage Marking')
    .addTag('media', 'Photos, Videos, Presigned Uploads')
    .addTag('work-orders', 'Work Orders & Job Calculation')
    .addTag('documents', 'Document Templates & Acts Generation')
    .addTag('tasks', 'Workshop Tasks')
    .addTag('reminders', 'Maintenance Reminders')
    .addTag('notifications', 'In-App Notifications')
    .addTag('search', 'Unified Global Search')
    .addTag('audit', 'Immutable Audit Logs')
    .addTag('backups', 'Backup & Restore')
    .addTag('reports', 'Analytics & KPI Reports')
    .addTag('health', 'System Health Check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AUTOMOTIVE OS — API Documentation',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 AUTOMOTIVE OS API is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
  logger.log(`🏥 Health Check available at: http://localhost:${port}/health`);
}

bootstrap();
