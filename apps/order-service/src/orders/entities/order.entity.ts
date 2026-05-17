import { Column, Entity, OneToMany } from 'typeorm';
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
  @Column()
  userId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'varchar', length: 20, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];
}
