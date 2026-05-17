import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@omni/database';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/product-service/.env',
    }),
    DatabaseModule.forRoot(),
    ProductsModule,
  ],
})
export class ProductServiceModule {}
