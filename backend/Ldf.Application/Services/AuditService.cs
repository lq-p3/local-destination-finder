using Ldf.Application.Interfaces;
using Ldf.Core.Entities;

namespace Ldf.Application.Services;

public class AuditService : IAuditService
{
    private readonly ILdfDbContext _context;

    public AuditService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string? userId, string action, string entityType, string entityId, string? metadata = null, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var log = new AuditLog
        {
            Id = Guid.NewGuid().ToString("N"),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            MetadataJsonSafe = metadata,
            IpAddressHash = string.IsNullOrEmpty(ipAddress) ? null : Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(ipAddress))),
            Timestamp = DateTime.UtcNow
        };

        await _context.AuditLogs.AddAsync(log, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
