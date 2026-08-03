using System.Threading;
using System.Threading.Tasks;

namespace Ldf.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(string? userId, string action, string entityType, string entityId, string? metadata = null, string? ipAddress = null, CancellationToken cancellationToken = default);
}
