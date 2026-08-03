import { apiRequest } from './apiClient';
import { 
  BookingApiModel, 
  CreateBookingApiRequest, 
  CheckoutApiRequest, 
  CheckoutApiResponse 
} from './bookingTypes';

export async function getBookings(signal?: AbortSignal): Promise<BookingApiModel[]> {
  return apiRequest<BookingApiModel[]>('/api/bookings', { signal, timeoutMs: 10000 });
}

export async function getBookingById(id: string, signal?: AbortSignal): Promise<BookingApiModel> {
  return apiRequest<BookingApiModel>(`/api/bookings/${encodeURIComponent(id)}`, { signal, timeoutMs: 10000 });
}

export async function createBooking(request: CreateBookingApiRequest): Promise<{ success: boolean; id: string; totalPrice: number; status: string }> {
  return apiRequest<{ success: boolean; id: string; totalPrice: number; status: string }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function checkoutBooking(request: CheckoutApiRequest): Promise<CheckoutApiResponse> {
  return apiRequest<CheckoutApiResponse>('/api/bookings/checkout', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function cancelBooking(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
    method: 'POST'
  });
}
