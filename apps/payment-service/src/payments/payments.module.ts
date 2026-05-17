import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaClientModule } from '@omni/kafka';
import { PaymentsService } from './payments.service';
import { PaymentEventsConsumer } from './payment-events.consumer';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    KafkaClientModule.register({
      clientId: 'payment-service-producer',
      groupId: 'payment-service-producer-group',
    }),
  ],
  controllers: [PaymentEventsConsumer],
  providers: [PaymentsService],
})
export class PaymentsModule {}
