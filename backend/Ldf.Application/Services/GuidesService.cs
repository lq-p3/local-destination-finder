using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;
using Ldf.Core.Entities;

namespace Ldf.Application.Services;

public class GuidesService : IGuidesService
{
    private readonly ILdfDbContext _context;

    public GuidesService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task<List<TravelGuideDto>> GetGuidesAsync(string? cityId, string? language, string? specialty, double? maxPrice, CancellationToken cancellationToken = default)
    {
        var query = _context.TravelGuides.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(cityId))
        {
            query = query.Where(g => g.CitiesCoveredEnJson.Contains(cityId) || g.CitiesCoveredArJson.Contains(cityId));
        }

        if (!string.IsNullOrEmpty(language))
        {
            query = query.Where(g => g.LanguagesEnJson.Contains(language) || g.LanguagesArJson.Contains(language));
        }

        if (!string.IsNullOrEmpty(specialty))
        {
            query = query.Where(g => g.SpecialtiesEnJson.Contains(specialty) || g.SpecialtiesArJson.Contains(specialty));
        }

        if (maxPrice.HasValue && maxPrice.Value > 0)
        {
            query = query.Where(g => g.PricePerDay <= maxPrice.Value);
        }

        var guides = await query.ToListAsync(cancellationToken);

        return guides.Select(g => new TravelGuideDto(
            g.Id,
            g.NameAr,
            g.NameEn,
            g.Avatar,
            g.Rating,
            g.PricePerDay,
            g.IsVerified,
            g.NameAr
        )).ToList();
    }

    public async Task<TravelGuideDto?> GetGuideByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var g = await _context.TravelGuides.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (g == null) return null;

        return new TravelGuideDto(
            g.Id,
            g.NameAr,
            g.NameEn,
            g.Avatar,
            g.Rating,
            g.PricePerDay,
            g.IsVerified,
            g.NameAr
        );
    }
}
