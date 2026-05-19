import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '@omni/database';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  // Cross-service reference (product_db) — no physical FK, explicit index
  @Index()
  @Column()
  productId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  // Snapshot of price at order time (intentional denormalization for history)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  // Same-DB FK — TypeORM creates index on order_id column automatically
  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;
}
