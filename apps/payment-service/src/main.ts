import './tracing';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { PaymentServiceModule } from './payment-service.module';
import { GlobalExceptionFilter, LoggingInterceptor, createWinstonOptions } from '@omni/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(PaymentServiceModule, {
    logger: WinstonModule.createLogger(createWinstonOptions('payment-service')),
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'payment-service-consumer',
        brokers: [process.env['KAFKA_BROKER'] ?? 'localhost:9092'],
      },
      consumer: { groupId: 'payment-service-consumer' },
    },
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Payment Service')
    .setDescription('Circuit Breaker demo ve ödeme işlemleri')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.startAllMicroservices();

  const port = process.env['PORT'] ?? 3003;
  await app.listen(port);
}

bootstrap();
