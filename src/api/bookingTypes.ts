export interface BookingPriceDetails {
  basePrice: number;
  taxes: number;
  totalPrice: number;
}

export interface BookingApiModel {
  id: string;
  userId: string;
  type: string;
  itemId: string;
  itemNameEn: string;
  itemNameAr: string;
  itemImage: string;
  status: string;
  startDate: string;
  endDate: string;
  priceDetails: BookingPriceDetails;
  qrCode: string;
  invoiceNumber: string;
  cancellationPolicyEn: string;
  cancellationPolicyAr: string;
  createdAt: string;
}

export interface CreateBookingApiRequest {
  itemId: string;
  type?: string;
  itemNameEn?: string;
  itemNameAr?: string;
  itemImage?: string;
  basePrice?: number;
  startDate?: string;
  endDate?: string;
}

export interface CheckoutApiRequest {
  basePrice: number;
  couponCode?: string;
  pointsToRedeem?: number;
  bookingId?: string;
}

export interface CheckoutApiResponse {
  success: boolean;
  totalPrice: number;
  discount: number;
  pointsEarned: number;
  newUserPoints: number;
}
