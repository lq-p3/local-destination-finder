using System;
using System.Collections.Generic;

namespace Ldf.Application.DTOs;

public record CreateFolderDto(
    string Name,
    bool IsPublic = false
);

public record FavoriteFolderDto(
    string Id,
    string Name,
    bool IsPublic,
    int ItemsCount,
    DateTime CreatedAt
);

public record AddFavoriteRequestDto(
    string ItemType,
    string ItemId,
    string? FolderId = null
);

public record FavoriteItemDto(
    string Id,
    string? FolderId,
    string? FolderName,
    string ItemType,
    string ItemId,
    DateTime CreatedAt
);
