import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@omni/database';

export enum SagaStep {
  STOCK_CHECK_REQUESTED = 'STOCK_CHECK_REQUESTED',
  STOCK_CHECK_COMPLETED = 'STOCK_CHECK_COMPLETED',
  PAYMENT_REQUESTED = 'PAYMENT_REQUESTED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  STOCK_DEDUCT_REQUESTED = 'STOCK_DEDUCT_REQUESTED',
  COMPLETED = 'COMPLETED',
  COMPENSATING = 'COMPENSATING',
  FAILED = 'FAILED',
}

@Entity('saga_states')
export class SagaState extends BaseEntity {
  @Column({ unique: true })
  orderId!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: SagaStep.STOCK_CHECK_REQUESTED,
  })
  currentStep!: SagaStep;

  @Column({ type: 'text', nullable: true })
  failureReason!: string | null;
}
