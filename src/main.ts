import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { databaseConfig } from './config/database.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get('security.cors.origin'),
    methods: configService.get('security.cors.methods'),
    credentials: configService.get('security.cors.credentials'),
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Enable global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Enable global guards
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
  app.useGlobalGuards(new RolesGuard(app.get(Reflector)));

  // Enable Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get('swagger.title'))
    .setDescription(configService.get('swagger.description'))
    .setVersion(configService.get('swagger.version'))
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(configService.get('swagger.path'), app, swaggerDocument);

  // Start the application
  const port = configService.get<number>('port');
  await app.listen(port, () => {
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger documentation is available at: http://localhost:${port}/docs`);
  });
}

bootstrap();
