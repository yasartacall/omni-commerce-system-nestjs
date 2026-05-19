import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import CircuitBreaker from 'opossum';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@omni/kafka';
import {
  PaymentRefundRequestedEvent,
  PaymentRequestedEvent,
  PaymentResultEvent,
} from '@omni/common';
import { Payment, PaymentStatus } from './entities/payment.entity';

type GatewayResult = { transactionId: string };

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly breaker: CircuitBreaker<[number, string], GatewayResult>;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @Inject(KAFKA_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {
    this.breaker = new CircuitBreaker<[number, string], GatewayResult>(
      (amount, userId) => this.mockGatewayCall(amount, userId),
      {
        timeout: 3000,
        errorThresholdPercentage: 50,
        resetTimeout: 10_000,
        name: 'payment-gateway',
      },
    );
  }

  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
  }

  // ─── Mock payment gateway ──────────────────────────────────────────────────
  private async mockGatewayCall(
    _amount: number,
    _userId: string,
  ): Promise<GatewayResult> {
    const delay = 100 + Math.random() * 200;
    await new Promise<void>((resolve) => setTimeout(resolve, delay));

    const failRate =
      _userId === '__force_fail__' ? 1.0
      : _userId === '__force_fail_deduct__' ? 0.0
      : 0.1;

    if (Math.random() < failRate) {
      throw new Error('Payment gateway timeout');
    }

    const txId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    return { transactionId: txId };
  }

  // ─── Saga handlers ─────────────────────────────────────────────────────────
  async processPayment(event: PaymentRequestedEvent): Promise<void> {
    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        orderId: event.orderId,
        userId: event.userId,
        amount: event.amount,
        status: PaymentStatus.PENDING,
        transactionId: null,
        failureReason: null,
      }),
    );

    let success = false;
    let transactionId: string | undefined;
    let reason: string | undefined;

    try {
      const result = await this.breaker.fire(event.amount, event.userId);
      transactionId = result.transactionId;
      success = true;
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionId = transactionId;
    } catch (err) {
      reason = err instanceof Error ? err.message : 'Payment failed';
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = reason;
    }

    await this.paymentRepo.save(payment);

    const resultEvent: PaymentResultEvent = {
      orderId: event.orderId,
      success,
      transactionId,
      reason,
    };
    this.kafkaClient.emit(KAFKA_TOPICS.ORDER_PAYMENT_RESULT, resultEvent);
  }

  async refundPayment(event: PaymentRefundRequestedEvent): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { orderId: event.orderId, status: PaymentStatus.COMPLETED },
    });
    if (!payment) return;

    payment.status = PaymentStatus.REFUNDED;
    payment.failureReason = event.reason;
    await this.paymentRepo.save(payment);
    // Fire-and-forget: no result event for refunds in this mock
  }
}
