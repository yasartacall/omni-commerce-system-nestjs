import { Controller, Injectable } from '@nestjs/common';
import { EventPattern, Payload, ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@omni/kafka';
import {
  StockCheckRequestedEvent,
  StockCheckResultEvent,
  StockDeductRequestedEvent,
  StockDeductResultEvent,
  StockRestoreRequestedEvent,
} from '@omni/common';
import { ProductsService } from './products.service';

@Injectable()
@Controller()
export class ProductEventsConsumer {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(KAFKA_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

  @EventPattern(KAFKA_TOPICS.ORDER_STOCK_CHECK_REQUESTED)
  async onStockCheckRequested(
    @Payload() event: StockCheckRequestedEvent,
  ): Promise<void> {
    let success = true;
    let reason: string | undefined;

    for (const item of event.items) {
      const ok = await this.productsService.checkStock(
        item.productId,
        item.quantity,
      );
      if (!ok) {
        success = false;
        reason = `Insufficient stock for product ${item.productId}`;
        break;
      }
    }

    const result: StockCheckResultEvent = {
      orderId: event.orderId,
      success,
      reason,
    };
    this.kafkaClient.emit(KAFKA_TOPICS.ORDER_STOCK_CHECK_RESULT, result);
  }

  @EventPattern(KAFKA_TOPICS.ORDER_STOCK_DEDUCT_REQUESTED)
  async onStockDeductRequested(
    @Payload() event: StockDeductRequestedEvent,
  ): Promise<void> {
    let success = true;
    let reason: string | undefined;

    if (event.forceFail) {
      success = false;
      reason = 'Simulated stock deduction failure (saga compensation demo)';
    } else {
      try {
        for (const item of event.items) {
          await this.productsService.deductStock(item.productId, item.quantity);
        }
      } catch (err) {
        success = false;
        reason = err instanceof Error ? err.message : 'Stock deduction error';
      }
    }

    const result: StockDeductResultEvent = {
      orderId: event.orderId,
      success,
      reason,
    };
    this.kafkaClient.emit(KAFKA_TOPICS.ORDER_STOCK_DEDUCT_RESULT, result);
  }

  @EventPattern(KAFKA_TOPICS.ORDER_STOCK_RESTORE_REQUESTED)
  async onStockRestoreRequested(
    @Payload() event: StockRestoreRequestedEvent,
  ): Promise<void> {
    for (const item of event.items) {
      await this.productsService.restoreStock(item.productId, item.quantity);
    }
    // Fire-and-forget compensating transaction — no result event needed
  }
}
