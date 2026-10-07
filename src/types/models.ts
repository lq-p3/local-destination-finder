export type UserRole = 'user' | 'guide' | 'office' | 'provider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  points: number;
  badges: string[];
  notificationSettings?: {
    bookings: boolean;
    offers: boolean;
    messages: boolean;
    system: boolean;
    weather: boolean;
  };
}

export interface Region {
  id: string;
  nameEn: string;
  nameAr: string;
  coverImage: string;
  descriptionEn: string;
  descriptionAr: string;
  bestTimeToVisitEn: string;
  bestTimeToVisitAr: string;
  famousFoodsEn: string[];
  famousFoodsAr: string[];
}

export interface City {
  id: string;
  regionId: string;
  nameEn: string;
  nameAr: string;
  coverImage: string;
  descriptionEn: string;
  descriptionAr: string;
  weather: {
    temp: number;
    statusEn: string;
    statusAr: string;
    wind: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

export type DestinationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'edit_needed';

export interface Destination {
  id: string;
  cityId: string;
  neighborhoodEn?: string;
  neighborhoodAr?: string;
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
    phone?: string;
    email?: string;
  };
  priceLevel: '$' | '$$' | '$$$';
  servicesEn: string[];
  servicesAr: string[];
  suitability: {
    families: boolean;
    kids: boolean;
    elderly: boolean;
    disabled: boolean;
  };
  status: DestinationStatus;
  submittedBy?: string; // User ID
  adminFeedback?: string;
  distanceEn?: string;
  distanceAr?: string;
}

export interface DestinationEdit {
  id: string;
  destinationId: string;
  userId: string;
  proposedChanges: Partial<Destination>;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DestinationReport {
  id: string;
  destinationId: string;
  userId: string;
  reason: string;
  details: string;
  createdAt: string;
}

export type PackageCategory = 'family' | 'youth' | 'adventure' | 'honeymoon' | 'oneday' | 'weekend' | 'economic' | 'luxury' | 'seasonal' | 'customizable';

export interface ItineraryDay {
  dayNumber: number;
  activitiesEn: { time: string; text: string; location?: string }[];
  activitiesAr: { time: string; text: string; location?: string }[];
}

export interface Package {
  id: string;
  officeId: string;
  officeNameEn: string;
  officeNameAr: string;
  nameEn: string;
  nameAr: string;
  category: PackageCategory;
  images: string[];
  citiesEn: string[];
  citiesAr: string[];
  durationDays: number;
  startDate: string;
  endDate: string;
  itinerary: ItineraryDay[];
  accommodationId?: string;
  roomId?: string;
  guideId?: string;
  transportTypeEn: string;
  transportTypeAr: string;
  pricePerPerson: number;
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

export interface FavoriteList {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  invitees: string[]; // List of user IDs/emails
  votes: Record<string, string[]>; // ItemID -> Array of userIds who voted for it
  items: {
    type: 'destination' | 'accommodation' | 'guide' | 'package';
    itemId: string;
  }[];
}

export interface Comparison {
  userId: string;
  itemIds: string[]; // Max 3 items (Package IDs or Destination IDs)
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'offer' | 'message' | 'system' | 'weather';
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  type: 'accommodation' | 'guide' | 'package';
  itemId: string;
  itemNameEn: string;
  itemNameAr: string;
  itemImage: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded' | 'rejected';
  startDate: string;
  endDate?: string;
  priceDetails: {
    basePrice: number;
    taxes: number;
    discount?: number;
    totalPrice: number;
  };
  qrCode: string; // Dynamic token string for rendering QR
  invoiceNumber: string;
  cancellationPolicyEn: string;
  cancellationPolicyAr: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  itemId: string; // destination/guide/package/accommodation id
  bookingId?: string;
  rating: number;
  comment: string;
  cleanlinessRating?: number;
  safetyRating?: number;
  priceRating?: number;
  serviceRating?: number;
  crowdRating?: number;
  createdAt: string;
}

export interface TravelOffice {
  id: string;
  userId: string; // The office manager's account
  nameEn: string;
  nameAr: string;
  logo: string;
  licenseNumber: string;
  isVerified: boolean;
  citiesServedEn: string[];
  citiesServedAr: string[];
  descriptionEn: string;
  descriptionAr: string;
  phone: string;
  email: string;
  workingHoursEn: string;
  workingHoursAr: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  termsEn: string;
  termsAr: string;
  cancellationPolicyEn: string;
  cancellationPolicyAr: string;
}

export type GuideAvailability = 'available' | 'busy' | 'offline';

export interface TravelGuide {
  id: string;
  userId: string; // User ID representing this guide
  nameEn: string;
  nameAr: string;
  avatar: string;
  licenseNumber: string;
  isVerified: boolean;
  languagesEn: string[];
  languagesAr: string[];
  specialtiesEn: string[];
  specialtiesAr: string[];
  citiesCoveredEn: string[];
  citiesCoveredAr: string[];
  pricePerHour: number;
  pricePerDay: number;
  rating: number;
  reviewsCount: number;
  yearsOfExperience: number;
  availability: GuideAvailability;
  workingHoursEn: string;
  workingHoursAr: string;
  servicesEn: string[];
  servicesAr: string[];
  approximateLocation: {
    lat: number;
    lng: number;
  };
}

export type AccommodationType = 'hotel' | 'resort' | 'chalet' | 'cabin' | 'farm' | 'rural_inn';

export interface RoomOption {
  id: string;
  nameEn: string;
  nameAr: string;
  pricePerNight: number;
  capacityAdults: number;
  capacityKids: number;
  facilitiesEn: string[];
  facilitiesAr: string[];
  availableCount: number;
}

export interface Accommodation {
  id: string;
  nameEn: string;
  nameAr: string;
  type: AccommodationType;
  images: string[];
  cityId: string;
  rating: number;
  reviewsCount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  descriptionEn: string;
  descriptionAr: string;
  stars: number;
  rooms: RoomOption[];
  facilitiesEn: string[];
  facilitiesAr: string[];
  checkInPolicyEn: string;
  checkInPolicyAr: string;
  checkOutPolicyEn: string;
  checkOutPolicyAr: string;
  cancellationPolicyEn: string;
  cancellationPolicyAr: string;
  distanceFromCenterKm: number;
}

export interface QuoteRequest {
  id: string;
  userId: string;
  userName: string;
  cities: string[];
  startDate: string;
  daysCount: number;
  budget: 'economic' | 'medium' | 'luxury';
  notes: string;
  createdAt: string;
}

export interface QuoteProposal {
  id: string;
  requestId: string;
  officeId: string;
  officeNameEn: string;
  officeNameAr: string;
  price: number;
  itinerarySummary: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  location?: { lat: number; lng: number };
  createdAt: string;
}

export interface ChatSession {
  id: string;
  participants: string[]; // User IDs (e.g. ['user_sarah', 'guide_abdullah'])
  messages: ChatMessage[];
}


