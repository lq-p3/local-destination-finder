using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ldf.Application.DTOs;

namespace Ldf.Application.Interfaces;

public interface IGuidesService
{
    Task<List<TravelGuideDto>> GetGuidesAsync(string? cityId, string? language, string? specialty, double? maxPrice, CancellationToken cancellationToken = default);
    Task<TravelGuideDto?> GetGuideByIdAsync(string id, CancellationToken cancellationToken = default);
}
