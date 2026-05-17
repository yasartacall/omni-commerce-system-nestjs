import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '@omni/database';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column()
  productId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;
}
