export interface QuoteProposalApiModel {
  id: string;
  requestId: string;
  officeId: string;
  officeNameEn: string;
  officeNameAr: string;
  price: number;
  currency: string;
  itinerarySummary: string;
  status: string;
  createdAt: string;
}

export interface QuoteRequestApiModel {
  id: string;
  userId: string;
  userName: string;
  cities: string[];
  startDate: string;
  daysCount: number;
  budget: string;
  notes: string;
  status: string;
  acceptedQuoteId?: string;
  createdAt: string;
  proposals?: QuoteProposalApiModel[];
}

export interface CreateQuoteRequestApiDto {
  cities: string[];
  startDate: string;
  daysCount: number;
  budget: string;
  notes: string;
}

export interface CreateProposalApiDto {
  officeNameEn?: string;
  officeNameAr?: string;
  price: number;
  itinerarySummary?: string;
}
