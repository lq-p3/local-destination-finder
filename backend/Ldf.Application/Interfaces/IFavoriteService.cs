using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ldf.Application.DTOs;

namespace Ldf.Application.Interfaces;

public interface IFavoriteService
{
    Task<IReadOnlyList<FavoriteFolderDto>> GetFoldersAsync(string userId, CancellationToken cancellationToken = default);
    Task<FavoriteFolderDto> CreateFolderAsync(string userId, CreateFolderDto dto, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FavoriteItemDto>> GetFavoritesAsync(string userId, string? folderId = null, CancellationToken cancellationToken = default);
    Task<FavoriteItemDto> AddFavoriteAsync(string userId, AddFavoriteRequestDto dto, CancellationToken cancellationToken = default);
    Task RemoveFavoriteAsync(string userId, string itemType, string itemId, CancellationToken cancellationToken = default);
}
