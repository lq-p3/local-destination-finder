using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Common;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;

namespace Ldf.Application.Services;

public record CategorizedSearchResultDto(
    List<RegionDto> Regions,
    List<CityDto> Cities,
    List<DestinationDto> Destinations,
    List<HotelDto> Hotels,
    List<RestaurantDto> Restaurants,
    List<CafeDto> Cafes,
    List<ActivityDto> Activities,
    List<EventDto> Events,
    List<PackageDto> Packages,
    List<TravelOfficeDto> Offices,
    List<TravelGuideDto> Guides
);

public interface IUnifiedSearchService
{
    Task<CategorizedSearchResultDto> SearchAsync(string query, CancellationToken cancellationToken = default);
    Task<List<UnifiedPlaceDto>> GetUnifiedPlacesAsync(string? regionId, string? cityId, string? category, CancellationToken cancellationToken = default);
}

public class UnifiedSearchService : IUnifiedSearchService
{
    private readonly ILdfDbContext _context;

    public UnifiedSearchService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task<CategorizedSearchResultDto> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return new CategorizedSearchResultDto(
                new(), new(), new(), new(), new(), new(), new(), new(), new(), new(), new()
            );
        }

        var normalized = ArabicNormalizer.Normalize(query.Trim().ToLower());

        var regions = await _context.Regions.AsNoTracking().ToListAsync(cancellationToken);
        var matchedRegions = regions.Where(r => 
            ArabicNormalizer.Normalize(r.NameAr).Contains(normalized) || 
            r.NameEn.ToLower().Contains(normalized)
        ).Select(r => new RegionDto(r.Id, r.Slug, r.NameAr, r.NameEn, r.DescriptionAr, r.DescriptionEn, r.CoverImage, r.Latitude, r.Longitude, r.BestTimeToVisitAr, r.BestTimeToVisitEn, new(), r.Cities?.Count ?? 0, 0)).ToList();

        var cities = await _context.Cities.AsNoTracking().ToListAsync(cancellationToken);
        var matchedCities = cities.Where(c => 
            ArabicNormalizer.Normalize(c.NameAr).Contains(normalized) || 
            c.NameEn.ToLower().Contains(normalized)
        ).Select(c => new CityDto(c.Id, c.Slug, c.RegionId, c.NameAr, c.NameEn, c.DescriptionAr, c.DescriptionEn, c.CoverImage, c.Latitude, c.Longitude, c.WeatherSummary, c.BestTimeToVisit)).ToList();

        var dests = await _context.Destinations.AsNoTracking().ToListAsync(cancellationToken);
        var matchedDests = dests.Where(d => 
            ArabicNormalizer.Normalize(d.NameAr).Contains(normalized) || 
            d.NameEn.ToLower().Contains(normalized)
        ).Select(d => new DestinationDto(d.Id, d.CityId, d.NameEn, d.NameAr, d.Category, d.Rating, d.ReviewsCount, d.Image, Array.Empty<string>(), d.DescriptionEn, d.DescriptionAr, new CoordinatesDto(d.Latitude, d.Longitude), d.WorkingHoursEn, d.WorkingHoursAr, d.EntryFees, new ContactInfoDto(d.Phone, d.Email), d.PriceLevel, Array.Empty<string>(), Array.Empty<string>(), new SuitabilityDto(d.FamiliesSuitability, d.KidsSuitability, d.ElderlySuitability, d.DisabledSuitability), d.Status, d.SubmittedBy, d.DistanceEn, d.DistanceAr)).ToList();

        var hotels = await _context.Hotels.AsNoTracking().ToListAsync(cancellationToken);
        var matchedHotels = hotels.Where(h => 
            ArabicNormalizer.Normalize(h.NameAr).Contains(normalized) || 
            h.NameEn.ToLower().Contains(normalized)
        ).Select(h => new HotelDto(h.Id, h.CityId, "", h.NameAr, h.NameEn, h.DescriptionAr, h.DescriptionEn, h.Stars, h.Rating, 12, 450.0, h.Latitude, h.Longitude, new(), h.MainImageId, "14:00", "12:00", h.Phone, h.Website, h.AddressAr)).ToList();

        var pkgs = await _context.Packages.AsNoTracking().ToListAsync(cancellationToken);
        var matchedPkgs = pkgs.Where(p => 
            ArabicNormalizer.Normalize(p.NameAr).Contains(normalized) || 
            p.NameEn.ToLower().Contains(normalized)
        ).Select(p => new PackageDto(p.Id, p.OfficeId, p.NameAr, p.NameEn, "", "", p.PricePerPerson, p.PricePerPerson * 1.2, "SAR", p.DurationDays, p.DurationDays - 1, p.TotalSeats, p.AvailableSeats, "", p.Rating, p.ReviewsCount, p.Category, p.InclusionsArJson, "Published")).ToList();

        return new CategorizedSearchResultDto(
            matchedRegions,
            matchedCities,
            matchedDests,
            matchedHotels,
            new(),
            new(),
            new(),
            new(),
            matchedPkgs,
            new(),
            new()
        );
    }

    public async Task<List<UnifiedPlaceDto>> GetUnifiedPlacesAsync(string? regionId, string? cityId, string? category, CancellationToken cancellationToken = default)
    {
        var result = new List<UnifiedPlaceDto>();

        var dests = await _context.Destinations.AsNoTracking().ToListAsync(cancellationToken);
        result.AddRange(dests
            .Where(d => (string.IsNullOrEmpty(cityId) || d.CityId == cityId))
            .Select(d => new UnifiedPlaceDto(d.Id, "destination", d.CityId, "", d.NameAr, d.NameEn, d.DescriptionAr, d.DescriptionEn, d.Latitude, d.Longitude, d.Image, d.Rating, d.ReviewsCount, "PRICE_LEVEL_MODERATE", "", "", d.Phone, d.Email, "09:00 AM - 11:00 PM")));

        var hotels = await _context.Hotels.AsNoTracking().ToListAsync(cancellationToken);
        result.AddRange(hotels
            .Where(h => (string.IsNullOrEmpty(cityId) || h.CityId == cityId))
            .Select(h => new UnifiedPlaceDto(h.Id, "hotel", h.CityId, "", h.NameAr, h.NameEn, h.DescriptionAr, h.DescriptionEn, h.Latitude, h.Longitude, h.MainImageId, h.Rating, 10, "PRICE_LEVEL_EXPENSIVE", h.AddressAr, h.AddressEn, h.Phone, h.Website, "24/7")));

        var cafes = await _context.Cafes.AsNoTracking().ToListAsync(cancellationToken);
        result.AddRange(cafes
            .Where(c => (string.IsNullOrEmpty(regionId) || c.RegionId == regionId) && (string.IsNullOrEmpty(cityId) || c.CityId == cityId))
            .Select(c => new UnifiedPlaceDto(c.Id, "cafe", c.CityId, c.RegionId, c.NameAr, c.NameEn, c.DescriptionAr, c.DescriptionEn, c.Latitude, c.Longitude, c.ImagesJson, c.Rating, c.ReviewsCount, c.PriceLevel, c.AddressAr, c.AddressEn, c.Phone, c.Website, c.OpeningHours)));

        return result;
    }
}
