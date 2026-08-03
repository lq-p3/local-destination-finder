using System;
using System.Collections.Generic;

namespace Ldf.Core.Entities;

public class FavoriteFolder
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = "Default";
    public bool IsPublic { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<FavoriteItem> Items { get; set; } = new List<FavoriteItem>();
}
