export interface PaymentIntentResponse {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
}

export interface PaymentConfirmResponse {
  success: boolean;
  paymentId: string;
  bookingId: string;
  status: string;
  confirmedAt: string;
}
