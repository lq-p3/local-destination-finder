using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Common;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;
using Ldf.Core;
using Ldf.Core.Entities;

namespace Ldf.Application.Services;

public class FavoriteService : IFavoriteService
{
    private readonly ILdfDbContext _context;

    public FavoriteService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<FavoriteFolderDto>> GetFoldersAsync(string userId, CancellationToken cancellationToken = default)
    {
        await EnsureDefaultFolderAsync(userId, cancellationToken);

        var folders = await _context.FavoriteFolders.AsNoTracking()
            .Where(f => f.UserId == userId)
            .Include(f => f.Items)
            .Select(f => new FavoriteFolderDto(
                f.Id,
                f.Name,
                f.IsPublic,
                f.Items.Count,
                f.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return folders;
    }

    public async Task<FavoriteFolderDto> CreateFolderAsync(string userId, CreateFolderDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ValidationException("Folder name is required.");
        }

        var folder = new FavoriteFolder
        {
            Id = "folder_" + Guid.NewGuid().ToString("N")[..8],
            UserId = userId,
            Name = dto.Name.Trim(),
            IsPublic = dto.IsPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.FavoriteFolders.AddAsync(folder, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new FavoriteFolderDto(folder.Id, folder.Name, folder.IsPublic, 0, folder.CreatedAt);
    }

    public async Task<IReadOnlyList<FavoriteItemDto>> GetFavoritesAsync(string userId, string? folderId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.FavoriteItems.AsNoTracking().Where(i => i.UserId == userId);

        if (!string.IsNullOrWhiteSpace(folderId))
        {
            query = query.Where(i => i.FolderId == folderId);
        }

        var items = await query
            .Include(i => i.Folder)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new FavoriteItemDto(
                i.Id,
                i.FolderId,
                i.Folder != null ? i.Folder.Name : "Default",
                i.ItemType,
                i.ItemId,
                i.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return items;
    }

    public async Task<FavoriteItemDto> AddFavoriteAsync(string userId, AddFavoriteRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.ItemType) || string.IsNullOrWhiteSpace(dto.ItemId))
        {
            throw new ValidationException("ItemType and ItemId are required.");
        }

        var itemTypeLower = dto.ItemType.ToLower();
        if (!FavoriteItemTypes.AllowedTypes.Contains(itemTypeLower))
        {
            throw new ValidationException($"Unsupported ItemType '{dto.ItemType}'. Allowed types: {string.Join(", ", FavoriteItemTypes.AllowedTypes)}");
        }

        var defaultFolder = await EnsureDefaultFolderAsync(userId, cancellationToken);
        var targetFolderId = string.IsNullOrWhiteSpace(dto.FolderId) ? defaultFolder.Id : dto.FolderId;

        // DB Unique Index Check
        var existing = await _context.FavoriteItems.AsNoTracking()
            .FirstOrDefaultAsync(i => i.UserId == userId && i.ItemType == itemTypeLower && i.ItemId == dto.ItemId, cancellationToken);

        if (existing != null)
        {
            throw new ConflictException("Item is already saved in favorites.", "DUPLICATE_FAVORITE");
        }

        var item = new FavoriteItem
        {
            Id = "fav_" + Guid.NewGuid().ToString("N")[..8],
            UserId = userId,
            FolderId = targetFolderId,
            ItemType = itemTypeLower,
            ItemId = dto.ItemId,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            await _context.FavoriteItems.AddAsync(item, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("Item is already saved in favorites.", "DUPLICATE_FAVORITE");
        }

        var folderName = (await _context.FavoriteFolders.AsNoTracking().FirstOrDefaultAsync(f => f.Id == targetFolderId, cancellationToken))?.Name ?? "Default";

        return new FavoriteItemDto(item.Id, item.FolderId, folderName, item.ItemType, item.ItemId, item.CreatedAt);
    }

    public async Task RemoveFavoriteAsync(string userId, string itemType, string itemId, CancellationToken cancellationToken = default)
    {
        var typeLower = itemType.ToLower();
        var item = await _context.FavoriteItems
            .FirstOrDefaultAsync(i => i.UserId == userId && i.ItemType == typeLower && i.ItemId == itemId, cancellationToken);

        if (item != null)
        {
            _context.FavoriteItems.Remove(item);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<FavoriteFolder> EnsureDefaultFolderAsync(string userId, CancellationToken cancellationToken)
    {
        var folder = await _context.FavoriteFolders
            .FirstOrDefaultAsync(f => f.UserId == userId && f.Name == "Default", cancellationToken);

        if (folder == null)
        {
            folder = new FavoriteFolder
            {
                Id = "folder_" + Guid.NewGuid().ToString("N")[..8],
                UserId = userId,
                Name = "Default",
                IsPublic = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _context.FavoriteFolders.AddAsync(folder, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return folder;
    }
}
