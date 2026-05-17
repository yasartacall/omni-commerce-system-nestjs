import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@omni/database';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/order-service/.env',
    }),
    DatabaseModule.forRoot(),
    OrdersModule,
  ],
})
export class OrderServiceModule {}
