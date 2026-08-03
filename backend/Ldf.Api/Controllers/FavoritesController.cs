using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;

namespace Ldf.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/favorites")]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites([FromQuery] string? folderId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var items = await _favoriteService.GetFavoritesAsync(userId, folderId, cancellationToken);
        return Ok(items);
    }

    [HttpGet("folders")]
    public async Task<IActionResult> GetFolders(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var folders = await _favoriteService.GetFoldersAsync(userId, cancellationToken);
        return Ok(folders);
    }

    [HttpPost("folders")]
    public async Task<IActionResult> CreateFolder([FromBody] CreateFolderDto dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var folder = await _favoriteService.CreateFolderAsync(userId, dto, cancellationToken);
        return Ok(folder);
    }

    [HttpPost]
    public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteRequestDto request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var item = await _favoriteService.AddFavoriteAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetFavorites), new { success = true, folderId = item.FolderId, itemType = item.ItemType, itemId = item.ItemId });
    }

    [HttpDelete("{itemType}/{itemId}")]
    public async Task<IActionResult> RemoveFavorite(string itemType, string itemId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _favoriteService.RemoveFavoriteAsync(userId, itemType, itemId, cancellationToken);
        return NoContent();
    }
}
