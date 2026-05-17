import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrderServiceModule } from './order-service.module';
import { GlobalExceptionFilter, LoggingInterceptor } from '@omni/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(OrderServiceModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'order-service-consumer',
        brokers: [process.env['KAFKA_BROKER'] ?? 'localhost:9092'],
      },
      consumer: { groupId: 'order-service-consumer' },
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

  const port = process.env['PORT'] ?? 3002;
  await app.listen(port);
}

bootstrap();
