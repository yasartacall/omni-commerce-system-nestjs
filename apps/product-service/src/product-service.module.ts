import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DatabaseModule } from '@omni/database';
import { ProductsModule } from './products/products.module';
import { RedisModule } from './redis/redis.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/product-service/.env',
    }),
    DatabaseModule.forRoot(),
    TerminusModule,
    TypeOrmModule,
    PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } }),
    RedisModule,
    ProductsModule,
  ],
  controllers: [HealthController],
})
export class ProductServiceModule {}
