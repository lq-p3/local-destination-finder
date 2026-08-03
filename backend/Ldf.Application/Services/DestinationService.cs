using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Common;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;
using Ldf.Core;
using Ldf.Core.Entities;

namespace Ldf.Application.Services;

public class DestinationService : IDestinationService
{
    private readonly ILdfDbContext _context;

    public DestinationService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResponse<DestinationDto>> SearchDestinationsAsync(DestinationQueryDto query, CancellationToken cancellationToken = default)
    {
        var dbQuery = _context.Destinations.AsNoTracking().AsQueryable();

        // Filter approved or public destinations for general query
        dbQuery = dbQuery.Where(d => d.Status == DestinationStatuses.Approved || d.Status == "approved" || string.IsNullOrEmpty(d.Status));

        if (!string.IsNullOrWhiteSpace(query.RegionId))
        {
            var cityIdsInRegion = _context.Cities.AsNoTracking()
                .Where(c => c.RegionId == query.RegionId)
                .Select(c => c.Id);
            dbQuery = dbQuery.Where(d => cityIdsInRegion.Contains(d.CityId));
        }

        if (!string.IsNullOrWhiteSpace(query.CityId))
        {
            dbQuery = dbQuery.Where(d => d.CityId == query.CityId);
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            dbQuery = dbQuery.Where(d => d.Category == query.Category);
        }

        if (query.MinimumRating.HasValue && query.MinimumRating > 0)
        {
            dbQuery = dbQuery.Where(d => d.Rating >= query.MinimumRating.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var normalizedSearch = ArabicNormalizer.Normalize(query.Search);
            dbQuery = dbQuery.Where(d => 
                EF.Functions.Like(d.NameEn, $"%{query.Search}%") || 
                EF.Functions.Like(d.NameAr, $"%{query.Search}%") ||
                EF.Functions.Like(d.DescriptionEn, $"%{query.Search}%") ||
                EF.Functions.Like(d.DescriptionAr, $"%{query.Search}%"));
        }

        // Sorting options
        dbQuery = query.Sort?.ToLower() switch
        {
            "rating_desc" => dbQuery.OrderByDescending(d => d.Rating),
            "name_asc" => dbQuery.OrderBy(d => d.NameEn),
            "newest" => dbQuery.OrderByDescending(d => d.Id),
            _ => dbQuery.OrderByDescending(d => d.Rating).ThenByDescending(d => d.ReviewsCount)
        };

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(d => MapToDto(d))
            .ToListAsync(cancellationToken);

        return new PagedResponse<DestinationDto>(items, query.Page, query.PageSize, totalCount);
    }

    public async Task<DestinationDto?> GetDestinationByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var d = await _context.Destinations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return d == null ? null : MapToDto(d);
    }

    public async Task<DestinationDto> SubmitDestinationAsync(CreateDestinationRequestDto request, string userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.NameEn) || string.IsNullOrWhiteSpace(request.NameAr))
        {
            throw new ValidationException("Both English and Arabic destination names are required.");
        }

        var destination = new Destination
        {
            Id = "dest_" + Guid.NewGuid().ToString("N")[..8],
            CityId = string.IsNullOrWhiteSpace(request.CityId) ? "riyadh" : request.CityId,
            NameEn = request.NameEn,
            NameAr = request.NameAr,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "Historical" : request.Category,
            Rating = 5.0,
            ReviewsCount = 0,
            Image = request.Image ?? "/riyadh_masmak.jpg",
            GalleryJson = JsonSerializer.Serialize(request.Gallery ?? new string[] { request.Image ?? "/riyadh_masmak.jpg" }),
            DescriptionEn = request.DescriptionEn ?? "",
            DescriptionAr = request.DescriptionAr ?? "",
            Latitude = request.Coordinates?.Lat ?? 24.7136,
            Longitude = request.Coordinates?.Lng ?? 46.6753,
            WorkingHoursEn = request.WorkingHoursEn ?? "9:00 AM - 6:00 PM",
            WorkingHoursAr = request.WorkingHoursAr ?? "9:00 ص - 6:00 م",
            EntryFees = request.EntryFees,
            Phone = request.ContactInfo?.Phone ?? "",
            Email = request.ContactInfo?.Email ?? "",
            PriceLevel = request.PriceLevel ?? "$$",
            ServicesEnJson = JsonSerializer.Serialize(request.ServicesEn ?? new string[] { "Restrooms" }),
            ServicesArJson = JsonSerializer.Serialize(request.ServicesAr ?? new string[] { "دورات مياه" }),
            FamiliesSuitability = request.Suitability?.Families ?? true,
            KidsSuitability = request.Suitability?.Kids ?? true,
            ElderlySuitability = request.Suitability?.Elderly ?? true,
            DisabledSuitability = request.Suitability?.Disabled ?? true,
            Status = DestinationStatuses.Pending,
            SubmittedBy = userId
        };

        await _context.Destinations.AddAsync(destination, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(destination);
    }

    public async Task<ReviewListResultDto> GetReviewsAsync(string itemType, string itemId, CancellationToken cancellationToken = default)
    {
        var type = ReviewItemTypes.AllowedTypes.Contains(itemType.ToLower()) ? itemType.ToLower() : ReviewItemTypes.Destination;

        var reviews = await _context.Reviews.AsNoTracking()
            .Where(r => r.ItemType == type && r.ItemId == itemId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        var avgRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 1) : 0.0;

        var dtos = reviews.Select(r => new ReviewDto(
            r.Id,
            r.ItemType,
            r.ItemId,
            r.UserId,
            r.UserName,
            r.Rating,
            r.Comment,
            r.CreatedAt
        )).ToList();

        return new ReviewListResultDto(dtos, dtos.Count, avgRating);
    }

    public async Task<ReviewDto> AddReviewAsync(string userId, CreateReviewDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
        {
            throw new ValidationException("Rating must be between 1 and 5 stars.");
        }

        var itemType = dto.ItemType.ToLower();
        if (!ReviewItemTypes.AllowedTypes.Contains(itemType))
        {
            throw new ValidationException($"Invalid itemType '{dto.ItemType}'. Allowed types: {string.Join(", ", ReviewItemTypes.AllowedTypes)}");
        }

        // Verify entity exists
        if (itemType == ReviewItemTypes.Destination)
        {
            var destExists = await _context.Destinations.AnyAsync(d => d.Id == dto.ItemId, cancellationToken);
            if (!destExists) throw new NotFoundException("Target destination not found.");
        }

        // Unique review check (UserId + ItemType + ItemId)
        var existingReview = await _context.Reviews.AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.ItemType == itemType && r.ItemId == dto.ItemId, cancellationToken);

        if (existingReview != null)
        {
            throw new ConflictException("You have already reviewed this item.", "DUPLICATE_REVIEW");
        }

        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        var userName = user?.Name ?? "Anonymous Traveler";

        var review = new Review
        {
            Id = "rev_" + Guid.NewGuid().ToString("N")[..8],
            UserId = userId,
            UserName = userName,
            ItemType = itemType,
            ItemId = dto.ItemId,
            Rating = dto.Rating,
            Comment = dto.Comment ?? "",
            CreatedAt = DateTime.UtcNow
        };

        await _context.Reviews.AddAsync(review, cancellationToken);

        // Recalculate target destination rating if item is a destination
        if (itemType == ReviewItemTypes.Destination)
        {
            var dest = await _context.Destinations.FirstOrDefaultAsync(d => d.Id == dto.ItemId, cancellationToken);
            if (dest != null)
            {
                var existingRatings = await _context.Reviews
                    .Where(r => r.ItemType == ReviewItemTypes.Destination && r.ItemId == dto.ItemId)
                    .Select(r => r.Rating)
                    .ToListAsync(cancellationToken);

                existingRatings.Add(dto.Rating);

                dest.ReviewsCount = existingRatings.Count;
                dest.Rating = Math.Round(existingRatings.Average(), 1);
                _context.Destinations.Update(dest);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new ReviewDto(review.Id, review.ItemType, review.ItemId, review.UserId, review.UserName, review.Rating, review.Comment, review.CreatedAt);
    }

    public async Task<DestinationDto> ApproveDestinationAsync(string destinationId, string adminUserId, CancellationToken cancellationToken = default)
    {
        var dest = await _context.Destinations.FirstOrDefaultAsync(d => d.Id == destinationId, cancellationToken);
        if (dest == null) throw new NotFoundException("Destination not found.");

        dest.Status = DestinationStatuses.Approved;
        _context.Destinations.Update(dest);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(dest);
    }

    public async Task<DestinationDto> RejectDestinationAsync(string destinationId, string adminUserId, string reason, CancellationToken cancellationToken = default)
    {
        var dest = await _context.Destinations.FirstOrDefaultAsync(d => d.Id == destinationId, cancellationToken);
        if (dest == null) throw new NotFoundException("Destination not found.");

        dest.Status = DestinationStatuses.Rejected;
        _context.Destinations.Update(dest);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(dest);
    }

    public async Task<PagedResponse<DestinationDto>> GetPendingDestinationsAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        var query = _context.Destinations.AsNoTracking().Where(d => d.Status == DestinationStatuses.Pending);
        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(d => MapToDto(d))
            .ToListAsync(cancellationToken);

        return new PagedResponse<DestinationDto>(items, request.Page, request.PageSize, totalCount);
    }

    private static DestinationDto MapToDto(Destination d)
    {
        return new DestinationDto(
            d.Id,
            d.CityId,
            d.NameEn,
            d.NameAr,
            d.Category,
            d.Rating,
            d.ReviewsCount,
            d.Image,
            JsonSerializer.Deserialize<string[]>(d.GalleryJson) ?? Array.Empty<string>(),
            d.DescriptionEn,
            d.DescriptionAr,
            new CoordinatesDto(d.Latitude, d.Longitude),
            d.WorkingHoursEn,
            d.WorkingHoursAr,
            d.EntryFees,
            new ContactInfoDto(d.Phone, d.Email),
            d.PriceLevel,
            JsonSerializer.Deserialize<string[]>(d.ServicesEnJson) ?? Array.Empty<string>(),
            JsonSerializer.Deserialize<string[]>(d.ServicesArJson) ?? Array.Empty<string>(),
            new SuitabilityDto(d.FamiliesSuitability, d.KidsSuitability, d.ElderlySuitability, d.DisabledSuitability),
            d.Status,
            d.SubmittedBy,
            d.DistanceEn,
            d.DistanceAr
        );
    }
}
