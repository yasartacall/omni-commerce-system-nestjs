import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@omni/database';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/payment-service/.env',
    }),
    DatabaseModule.forRoot(),
    PaymentsModule,
  ],
})
export class PaymentServiceModule {}
