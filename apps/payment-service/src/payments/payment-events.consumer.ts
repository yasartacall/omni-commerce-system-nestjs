import { Controller, Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@omni/kafka';
import {
  PaymentRefundRequestedEvent,
  PaymentRequestedEvent,
} from '@omni/common';
import { PaymentsService } from './payments.service';

@Injectable()
@Controller()
export class PaymentEventsConsumer {
  constructor(private readonly paymentsService: PaymentsService) {}

  @EventPattern(KAFKA_TOPICS.ORDER_PAYMENT_REQUESTED)
  async onPaymentRequested(
    @Payload() event: PaymentRequestedEvent,
  ): Promise<void> {
    await this.paymentsService.processPayment(event);
  }

  @EventPattern(KAFKA_TOPICS.ORDER_PAYMENT_REFUND_REQUESTED)
  async onRefundRequested(
    @Payload() event: PaymentRefundRequestedEvent,
  ): Promise<void> {
    await this.paymentsService.refundPayment(event);
  }
}
