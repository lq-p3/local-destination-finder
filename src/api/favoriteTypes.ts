export type FavoriteItemType = 'destination' | 'package' | 'accommodation' | 'guide';

export interface FavoriteItemApiModel {
  id: string;
  folderId: string;
  folderName: string;
  itemType: FavoriteItemType;
  itemId: string;
}

export interface FavoriteFolderApiModel {
  id: string;
  name: string;
  isPublic: boolean;
  itemsCount: number;
}

export interface AddFavoriteApiRequest {
  itemType: FavoriteItemType;
  itemId: string;
  folderId?: string | null;
}

export interface CreateFolderApiRequest {
  name: string;
  isPublic?: boolean;
}
