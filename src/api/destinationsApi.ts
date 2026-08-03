import { apiRequest } from './apiClient';
import { 
  DestinationApiModel, 
  CreateDestinationApiRequest, 
  DestinationReviewsResponse, 
  CreateReviewApiRequest 
} from './destinationTypes';

export async function getDestinations(signal?: AbortSignal): Promise<DestinationApiModel[]> {
  return apiRequest<DestinationApiModel[]>('/api/destinations', { signal, timeoutMs: 10000 });
}

export async function getDestinationById(id: string, signal?: AbortSignal): Promise<DestinationApiModel> {
  return apiRequest<DestinationApiModel>(`/api/destinations/${encodeURIComponent(id)}`, { signal, timeoutMs: 10000 });
}

export async function createDestination(request: CreateDestinationApiRequest): Promise<{ success: boolean; id: string; status: string }> {
  return apiRequest<{ success: boolean; id: string; status: string }>('/api/destinations', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function getDestinationReviews(destinationId: string, signal?: AbortSignal): Promise<DestinationReviewsResponse> {
  return apiRequest<DestinationReviewsResponse>(`/api/destinations/${encodeURIComponent(destinationId)}/reviews`, { signal, timeoutMs: 10000 });
}

export async function createDestinationReview(
  destinationId: string, 
  request: CreateReviewApiRequest
): Promise<{ success: boolean; newAverageRating: number; newReviewsCount: number }> {
  return apiRequest<{ success: boolean; newAverageRating: number; newReviewsCount: number }>(`/api/destinations/${encodeURIComponent(destinationId)}/reviews`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}
