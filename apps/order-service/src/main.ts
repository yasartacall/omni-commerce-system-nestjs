import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Omni Commerce — Order Service')
    .setDescription('Sipariş oluşturma ve Saga orkestrasyon’u')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.startAllMicroservices();

  const port = process.env['PORT'] ?? 3002;
  await app.listen(port);
}

bootstrap();
