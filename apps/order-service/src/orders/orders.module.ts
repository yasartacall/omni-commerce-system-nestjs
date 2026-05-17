import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaClientModule } from '@omni/kafka';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderEventsConsumer } from './order-events.consumer';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { SagaState } from './entities/saga-state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, SagaState]),
    KafkaClientModule.register({
      clientId: 'order-service-producer',
      groupId: 'order-service-producer-group',
    }),
  ],
  controllers: [OrdersController, OrderEventsConsumer],
  providers: [OrdersService],
})
export class OrdersModule {}
