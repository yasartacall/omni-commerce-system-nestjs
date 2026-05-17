import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@omni/database';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @Column()
  orderId!: string;

  @Column()
  userId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId!: string | null;

  @Column({ type: 'text', nullable: true })
  failureReason!: string | null;
}
