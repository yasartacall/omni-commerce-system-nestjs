import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaClientModule } from '@omni/kafka';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductEventsConsumer } from './product-events.consumer';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    RedisModule,
    KafkaClientModule.register({
      clientId: 'product-service-producer',
      groupId: 'product-service-producer-group',
    }),
  ],
  controllers: [ProductsController, ProductEventsConsumer],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
