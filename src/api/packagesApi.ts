import { apiRequest } from './apiClient';
import { PackageApiModel, PackageComparisonResponse } from './packageTypes';

export async function getPackages(category?: string, search?: string, signal?: AbortSignal): Promise<PackageApiModel[]> {
  const queryParams = new URLSearchParams();
  if (category) queryParams.append('category', category);
  if (search) queryParams.append('search', search);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest<PackageApiModel[]>(`/api/packages${queryString}`, { signal, timeoutMs: 10000 });
}

export async function getPackageById(id: string, signal?: AbortSignal): Promise<PackageApiModel> {
  return apiRequest<PackageApiModel>(`/api/packages/${encodeURIComponent(id)}`, { signal, timeoutMs: 10000 });
}

export async function comparePackages(packageIds: string[]): Promise<PackageComparisonResponse> {
  return apiRequest<PackageComparisonResponse>('/api/packages/compare', {
    method: 'POST',
    body: JSON.stringify({ packageIds })
  });
}
