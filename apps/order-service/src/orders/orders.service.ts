import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@omni/kafka';
import {
  OrderCompletedEvent,
  OrderFailedEvent,
  PaymentRefundRequestedEvent,
  PaymentRequestedEvent,
  PaymentResultEvent,
  StockCheckRequestedEvent,
  StockCheckResultEvent,
  StockDeductRequestedEvent,
  StockDeductResultEvent,
  CreateOrderDto,
} from '@omni/common';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { SagaState, SagaStep } from './entities/saga-state.entity';

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(SagaState)
    private readonly sagaRepo: Repository<SagaState>,
    @Inject(KAFKA_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
  }

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const items = dto.items.map((i) =>
      this.orderItemRepo.create({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }),
    );

    const order = this.orderRepo.create({
      userId,
      totalAmount,
      status: OrderStatus.PROCESSING,
      items,
    });
    const saved = await this.orderRepo.save(order);

    await this.sagaRepo.save(
      this.sagaRepo.create({
        orderId: saved.id,
        currentStep: SagaStep.STOCK_CHECK_REQUESTED,
        failureReason: null,
      }),
    );

    const event: StockCheckRequestedEvent = {
      orderId: saved.id,
      items: dto.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };
    this.kafkaClient.emit(KAFKA_TOPICS.ORDER_STOCK_CHECK_REQUESTED, event);

    return saved;
  }

  async findAll(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  // ─── Saga event handlers ────────────────────────────────────────────────────

  async handleStockCheckResult(event: StockCheckResultEvent): Promise<void> {
    const [saga, order] = await Promise.all([
      this.sagaRepo.findOne({ where: { orderId: event.orderId } }),
      this.orderRepo.findOne({
        where: { id: event.orderId },
        relations: ['items'],
      }),
    ]);
    if (!saga || !order) return;

    if (event.success) {
      saga.currentStep = SagaStep.PAYMENT_REQUESTED;
      await this.sagaRepo.save(saga);

      const paymentEvent: PaymentRequestedEvent = {
        orderId: order.id,
        userId: order.userId,
        amount: Number(order.totalAmount),
      };
      this.kafkaClient.emit(KAFKA_TOPICS.ORDER_PAYMENT_REQUESTED, paymentEvent);
    } else {
      saga.currentStep = SagaStep.FAILED;
      saga.failureReason = event.reason ?? 'Insufficient stock';
      await this.sagaRepo.save(saga);

      order.status = OrderStatus.FAILED;
      await this.orderRepo.save(order);

      const failedEvent: OrderFailedEvent = {
        orderId: order.id,
        reason: saga.failureReason!,
      };
      this.kafkaClient.emit(KAFKA_TOPICS.ORDER_FAILED, failedEvent);
    }
  }

  async handlePaymentResult(event: PaymentResultEvent): Promise<void> {
    const [saga, order] = await Promise.all([
      this.sagaRepo.findOne({ where: { orderId: event.orderId } }),
      this.orderRepo.findOne({
        where: { id: event.orderId },
        relations: ['items'],
      }),
    ]);
    if (!saga || !order) return;

    if (event.success) {
      saga.currentStep = SagaStep.STOCK_DEDUCT_REQUESTED;
      await this.sagaRepo.save(saga);

      const deductEvent: StockDeductRequestedEvent = {
        orderId: order.id,
        items: order.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };
      this.kafkaClient.emit(
        KAFKA_TOPICS.ORDER_STOCK_DEDUCT_REQUESTED,
        deductEvent,
      );
    } else {
      saga.currentStep = SagaStep.FAILED;
      saga.failureReason = event.reason ?? 'Payment failed';
      await this.sagaRepo.save(saga);

      order.status = OrderStatus.FAILED;
      await this.orderRepo.save(order);

      const failedEvent: OrderFailedEvent = {
        orderId: order.id,
        reason: saga.failureReason!,
      };
      this.kafkaClient.emit(KAFKA_TOPICS.ORDER_FAILED, failedEvent);
    }
  }

  async handleStockDeductResult(event: StockDeductResultEvent): Promise<void> {
    const [saga, order] = await Promise.all([
      this.sagaRepo.findOne({ where: { orderId: event.orderId } }),
      this.orderRepo.findOne({
        where: { id: event.orderId },
        relations: ['items'],
      }),
    ]);
    if (!saga || !order) return;

    if (event.success) {
      saga.currentStep = SagaStep.COMPLETED;
      await this.sagaRepo.save(saga);

      order.status = OrderStatus.COMPLETED;
      await this.orderRepo.save(order);

      const completedEvent: OrderCompletedEvent = {
        orderId: order.id,
        userId: order.userId,
        totalAmount: Number(order.totalAmount),
      };
      this.kafkaClient.emit(KAFKA_TOPICS.ORDER_COMPLETED, completedEvent);
    } else {
      saga.currentStep = SagaStep.COMPENSATING;
      saga.failureReason = event.reason ?? 'Stock deduction failed';
      await this.sagaRepo.save(saga);

      order.status = OrderStatus.FAILED;
      await this.orderRepo.save(order);

      // Compensating: refund the payment
      const refundEvent: PaymentRefundRequestedEvent = {
        orderId: order.id,
        userId: order.userId,
        amount: Number(order.totalAmount),
        reason: saga.failureReason!,
      };
      this.kafkaClient.emit(
        KAFKA_TOPICS.ORDER_PAYMENT_REFUND_REQUESTED,
        refundEvent,
      );

      const failedEvent: OrderFailedEvent = {
        orderId: order.id,
        reason: saga.failureReason!,
      };
      this.kafkaClient.emit(KAFKA_TOPICS.ORDER_FAILED, failedEvent);
    }
  }
}
