import { apiRequest } from './apiClient';
import { RegionApiModel, RegionDetailsResponse } from './apiTypes';

export async function getRegions(signal?: AbortSignal): Promise<RegionApiModel[]> {
  return apiRequest<RegionApiModel[]>('/api/regions', { signal, timeoutMs: 10000 });
}

export async function getRegionById(id: string, signal?: AbortSignal): Promise<RegionDetailsResponse> {
  return apiRequest<RegionDetailsResponse>(`/api/regions/${encodeURIComponent(id)}`, { signal, timeoutMs: 10000 });
}
