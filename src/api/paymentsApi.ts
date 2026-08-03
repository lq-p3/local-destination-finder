import { apiRequest } from './apiClient';
import { PaymentIntentResponse, PaymentConfirmResponse } from './paymentTypes';

export async function createPaymentIntent(bookingId: string): Promise<PaymentIntentResponse> {
  return apiRequest<PaymentIntentResponse>('/api/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({ bookingId })
  });
}

export async function confirmDevelopmentPayment(paymentId: string): Promise<PaymentConfirmResponse> {
  return apiRequest<PaymentConfirmResponse>(`/api/payments/${encodeURIComponent(paymentId)}/confirm`, {
    method: 'POST'
  });
}

export async function getPayment(paymentId: string, signal?: AbortSignal): Promise<PaymentIntentResponse> {
  return apiRequest<PaymentIntentResponse>(`/api/payments/${encodeURIComponent(paymentId)}`, { signal, timeoutMs: 10000 });
}
