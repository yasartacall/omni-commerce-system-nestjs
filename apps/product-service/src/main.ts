import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ProductServiceModule } from './product-service.module';
import { GlobalExceptionFilter, LoggingInterceptor } from '@omni/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ProductServiceModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
}

bootstrap();

