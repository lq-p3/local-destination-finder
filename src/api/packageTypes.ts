export interface PackageApiModel {
  id: string;
  officeId: string;
  officeNameEn: string;
  officeNameAr: string;
  nameEn: string;
  nameAr: string;
  category: string;
  images: string[];
  citiesEn: string[];
  citiesAr: string[];
  durationDays: number;
  startDate: string;
  endDate: string;
  itinerary: any[];
  transportTypeEn: string;
  transportTypeAr: string;
  pricePerPerson: number;
  currency: string;
  totalSeats: number;
  remainingSeats: number;
  inclusionsEn: string[];
  inclusionsAr: string[];
  exclusionsEn: string[];
  exclusionsAr: string[];
  termsEn: string;
  termsAr: string;
  cancellationPolicyEn: string;
  cancellationPolicyAr: string;
  rating: number;
  reviewsCount: number;
  isAvailable: boolean;
}

export interface PackageComparisonResponse {
  packages: PackageApiModel[];
}
