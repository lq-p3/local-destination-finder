export interface DestinationApiModel {
  id: string;
  cityId: string;
  nameEn: string;
  nameAr: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  descriptionEn: string;
  descriptionAr: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  workingHoursEn: string;
  workingHoursAr: string;
  entryFees: number;
  contactInfo: {
    phone: string;
    email: string;
  };
  priceLevel: string;
  servicesEn: string[];
  servicesAr: string[];
  suitability: {
    families: boolean;
    kids: boolean;
    elderly: boolean;
    disabled: boolean;
  };
  status: string;
  submittedBy: string;
  distanceEn: string;
  distanceAr: string;
}

export interface CreateDestinationApiRequest {
  cityId: string;
  nameEn: string;
  nameAr: string;
  category: string;
  image?: string;
  gallery?: string[];
  descriptionEn: string;
  descriptionAr: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  workingHoursEn?: string;
  workingHoursAr?: string;
  entryFees?: number;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  priceLevel?: string;
  servicesEn?: string[];
  servicesAr?: string[];
  suitability?: {
    families?: boolean;
    kids?: boolean;
    elderly?: boolean;
    disabled?: boolean;
  };
}

export interface DestinationReviewApiModel {
  id: string;
  destinationId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DestinationReviewsResponse {
  items: DestinationReviewApiModel[];
  totalCount: number;
  averageRating: number;
}

export interface CreateReviewApiRequest {
  rating: number;
  comment: string;
}
