import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DatabaseModule } from '@omni/database';
import { PaymentsModule } from './payments/payments.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/payment-service/.env',
    }),
    DatabaseModule.forRoot(),
    TerminusModule,
    TypeOrmModule,
    PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } }),
    PaymentsModule,
  ],
  controllers: [HealthController],
})
export class PaymentServiceModule {}
