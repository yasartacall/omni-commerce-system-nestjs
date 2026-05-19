import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@omni/database';

@Entity('products')
export class Product extends BaseEntity {
  @Index()
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // Indexed for price-range queries (e.g. GET /products?maxPrice=100)
  @Index()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  // Indexed for low-stock alerts and stock-check saga queries
  @Index()
  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity!: number;
}
