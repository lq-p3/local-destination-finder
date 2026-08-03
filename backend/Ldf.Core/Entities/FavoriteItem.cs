using System;

namespace Ldf.Core.Entities;

public class FavoriteItem
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? FolderId { get; set; }

    public string ItemType { get; set; } = string.Empty;
    public string ItemId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public FavoriteFolder? Folder { get; set; }
}
