using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Interfaces;

namespace Ldf.Application.Services;

public class RecommendationService : IRecommendationService
{
    private readonly ILdfDbContext _context;

    public RecommendationService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<RecommendationItemDto>> GetRecommendationsAsync(string? userId, string? category = null, string? cityId = null, CancellationToken cancellationToken = default)
    {
        var destinations = await _context.Destinations.AsNoTracking()
            .Where(d => d.Status == "approved" || string.IsNullOrEmpty(d.Status))
            .Take(50)
            .ToListAsync(cancellationToken);

        var favoriteItemIds = new HashSet<string>();
        if (!string.IsNullOrEmpty(userId))
        {
            var favs = await _context.FavoriteItems.AsNoTracking()
                .Where(f => f.UserId == userId)
                .Select(f => f.ItemId)
                .ToListAsync(cancellationToken);
            favoriteItemIds = new HashSet<string>(favs);
        }

        var results = new List<RecommendationItemDto>();
        foreach (var d in destinations)
        {
            double score = 0.5;
            var reasons = new List<string>();

            if (d.Rating >= 4.5)
            {
                score += 0.25;
                reasons.Add("تقييم ممتاز أعلى من 4.5 نجوم");
            }

            if (!string.IsNullOrEmpty(category) && d.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
            {
                score += 0.2;
                reasons.Add("يتناسب مع التصنيف المفضل");
            }

            if (!string.IsNullOrEmpty(cityId) && d.CityId.Equals(cityId, StringComparison.OrdinalIgnoreCase))
            {
                score += 0.15;
                reasons.Add("في المدينة المختارة");
            }

            if (favoriteItemIds.Contains(d.Id))
            {
                score += 0.1;
                reasons.Add("ضمن قائمة المفضلة لديك");
            }

            if (reasons.Count == 0)
            {
                reasons.Add("وجهة مميزة وموصى بها في السعودية");
            }

            score = Math.Min(score, 0.99);

            results.Add(new RecommendationItemDto(
                d.Id,
                d.NameEn,
                d.NameAr,
                d.Category,
                Math.Round(score, 2),
                reasons
            ));
        }

        return results.OrderByDescending(r => r.Score).Take(10).ToList();
    }
}
