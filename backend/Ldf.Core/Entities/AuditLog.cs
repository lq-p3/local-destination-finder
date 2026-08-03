using System;

namespace Ldf.Core.Entities;

public class AuditLog
{
    public string Id { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? IpAddressHash { get; set; }
    public string? MetadataJsonSafe { get; set; }

    public User? User { get; set; }
}
