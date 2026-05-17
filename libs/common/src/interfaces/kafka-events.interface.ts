export interface StockCheckRequestedEvent {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface StockCheckResultEvent {
  orderId: string;
  success: boolean;
  reason?: string;
}

export interface PaymentRequestedEvent {
  orderId: string;
  userId: string;
  amount: number;
}

export interface PaymentResultEvent {
  orderId: string;
  success: boolean;
  transactionId?: string;
  reason?: string;
}

export interface StockDeductRequestedEvent {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface StockDeductResultEvent {
  orderId: string;
  success: boolean;
  reason?: string;
}

export interface StockRestoreRequestedEvent {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface PaymentRefundRequestedEvent {
  orderId: string;
  userId: string;
  amount: number;
  reason: string;
}

export interface OrderCompletedEvent {
  orderId: string;
  userId: string;
  totalAmount: number;
}

export interface OrderFailedEvent {
  orderId: string;
  reason: string;
}
