using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ldf.Application.Interfaces;

public record RecommendationItemDto(
    string Id,
    string NameEn,
    string NameAr,
    string Category,
    double Score,
    IReadOnlyList<string> Reasons
);

public interface IRecommendationService
{
    Task<IReadOnlyList<RecommendationItemDto>> GetRecommendationsAsync(string? userId, string? category = null, string? cityId = null, CancellationToken cancellationToken = default);
}
