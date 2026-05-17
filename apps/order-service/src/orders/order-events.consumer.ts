import { Controller, Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@omni/kafka';
import {
  StockCheckResultEvent,
  PaymentResultEvent,
  StockDeductResultEvent,
} from '@omni/common';
import { OrdersService } from './orders.service';

@Injectable()
@Controller()
export class OrderEventsConsumer {
  constructor(private readonly ordersService: OrdersService) {}

  @EventPattern(KAFKA_TOPICS.ORDER_STOCK_CHECK_RESULT)
  async onStockCheckResult(
    @Payload() event: StockCheckResultEvent,
  ): Promise<void> {
    await this.ordersService.handleStockCheckResult(event);
  }

  @EventPattern(KAFKA_TOPICS.ORDER_PAYMENT_RESULT)
  async onPaymentResult(@Payload() event: PaymentResultEvent): Promise<void> {
    await this.ordersService.handlePaymentResult(event);
  }

  @EventPattern(KAFKA_TOPICS.ORDER_STOCK_DEDUCT_RESULT)
  async onStockDeductResult(
    @Payload() event: StockDeductResultEvent,
  ): Promise<void> {
    await this.ordersService.handleStockDeductResult(event);
  }
}
