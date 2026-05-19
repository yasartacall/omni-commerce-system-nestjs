import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@omni/database';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('orders')
export class Order extends BaseEntity {
  // Cross-service reference (auth_db) — no physical FK, explicit index for query performance
  @Index()
  @Column()
  userId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  // Indexed for status-based filtering (e.g. GET /orders?status=PENDING)
  @Index()
  @Column({ type: 'varchar', length: 20, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];
}
