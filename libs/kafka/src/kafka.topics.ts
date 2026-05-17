export const KAFKA_TOPICS = {
  ORDER_STOCK_CHECK_REQUESTED: 'order.stock-check-requested',
  ORDER_STOCK_CHECK_RESULT: 'order.stock-check-result',
  ORDER_PAYMENT_REQUESTED: 'order.payment-requested',
  ORDER_PAYMENT_RESULT: 'order.payment-result',
  ORDER_STOCK_DEDUCT_REQUESTED: 'order.stock-deduct-requested',
  ORDER_STOCK_DEDUCT_RESULT: 'order.stock-deduct-result',
  ORDER_STOCK_RESTORE_REQUESTED: 'order.stock-restore-requested',
  ORDER_PAYMENT_REFUND_REQUESTED: 'order.payment-refund-requested',
  ORDER_COMPLETED: 'order.completed',
  ORDER_FAILED: 'order.failed',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
