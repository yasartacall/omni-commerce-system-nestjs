import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProductServiceModule } from './product-service.module';
import { GlobalExceptionFilter, LoggingInterceptor } from '@omni/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ProductServiceModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'product-service-consumer',
        brokers: [process.env['KAFKA_BROKER'] ?? 'localhost:9092'],
      },
      consumer: { groupId: 'product-service-consumer' },
    },
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.startAllMicroservices();

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
}

bootstrap();
