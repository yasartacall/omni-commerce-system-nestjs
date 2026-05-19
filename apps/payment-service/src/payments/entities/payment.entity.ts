import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@omni/database';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
// Composite index: payment lookup by order + status (saga compensation queries)
@Index(['orderId', 'status'])
export class Payment extends BaseEntity {
  // Cross-service reference (order_db) — no physical FK, explicit index
  @Index()
  @Column()
  orderId!: string;

  // Cross-service reference (auth_db) — no physical FK, explicit index
  @Index()
  @Column()
  userId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Index()
  @Column({ type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId!: string | null;

  @Column({ type: 'text', nullable: true })
  failureReason!: string | null;
}
