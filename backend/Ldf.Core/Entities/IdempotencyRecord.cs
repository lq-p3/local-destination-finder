using System;

namespace Ldf.Core.Entities;

public class IdempotencyRecord
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Operation { get; set; } = string.Empty;
    public string? ResourceId { get; set; }
    public int ResponseStatus { get; set; }
    public string ResponseBody { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);

    public User? User { get; set; }
}
