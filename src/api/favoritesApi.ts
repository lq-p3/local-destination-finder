import { apiRequest } from './apiClient';
import { 
  FavoriteItemApiModel, 
  FavoriteFolderApiModel, 
  AddFavoriteApiRequest, 
  CreateFolderApiRequest 
} from './favoriteTypes';

export async function getFavorites(signal?: AbortSignal): Promise<FavoriteItemApiModel[]> {
  return apiRequest<FavoriteItemApiModel[]>('/api/favorites', { signal, timeoutMs: 10000 });
}

export async function addFavorite(request: AddFavoriteApiRequest): Promise<{ success: boolean; folderId: string; itemType: string; itemId: string }> {
  return apiRequest<{ success: boolean; folderId: string; itemType: string; itemId: string }>('/api/favorites', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function removeFavorite(itemType: string, itemId: string): Promise<void> {
  return apiRequest<void>(`/api/favorites/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}`, {
    method: 'DELETE'
  });
}

export async function getFavoriteFolders(signal?: AbortSignal): Promise<FavoriteFolderApiModel[]> {
  return apiRequest<FavoriteFolderApiModel[]>('/api/favorite-folders', { signal, timeoutMs: 10000 });
}

export async function createFavoriteFolder(request: CreateFolderApiRequest): Promise<FavoriteFolderApiModel> {
  return apiRequest<FavoriteFolderApiModel>('/api/favorite-folders', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export async function updateFavoriteFolder(id: string, request: CreateFolderApiRequest): Promise<{ success: boolean; id: string; name: string }> {
  return apiRequest<{ success: boolean; id: string; name: string }>(`/api/favorite-folders/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(request)
  });
}

export async function deleteFavoriteFolder(id: string): Promise<void> {
  return apiRequest<void>(`/api/favorite-folders/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}
