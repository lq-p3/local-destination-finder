using System;
using Ldf.Application.Common;

namespace Ldf.Application.DTOs;

public record DestinationQueryDto : PagedRequest
{
    public string? Search { get; set; }
    public string? RegionId { get; set; }
    public string? CityId { get; set; }
    public string? Category { get; set; }
    public double? MinimumRating { get; set; }
    public string? Sort { get; set; } // newest, rating_desc, price_asc, price_desc, name_asc
}

public record DestinationDto(
    string Id,
    string CityId,
    string NameEn,
    string NameAr,
    string Category,
    double Rating,
    int Reviews,
    string Image,
    string[] Gallery,
    string DescriptionEn,
    string DescriptionAr,
    CoordinatesDto Coordinates,
    string WorkingHoursEn,
    string WorkingHoursAr,
    double EntryFees,
    ContactInfoDto ContactInfo,
    string PriceLevel,
    string[] ServicesEn,
    string[] ServicesAr,
    SuitabilityDto Suitability,
    string Status,
    string? SubmittedBy,
    string? DistanceEn,
    string? DistanceAr
);

public record CoordinatesDto(double Lat, double Lng);
public record ContactInfoDto(string Phone, string Email);
public record SuitabilityDto(bool Families, bool Kids, bool Elderly, bool Disabled);

public record CreateDestinationRequestDto(
    string CityId,
    string NameEn,
    string NameAr,
    string Category,
    string? Image,
    string[]? Gallery,
    string DescriptionEn,
    string DescriptionAr,
    CoordinatesDto? Coordinates,
    string? WorkingHoursEn,
    string? WorkingHoursAr,
    double EntryFees,
    ContactInfoDto? ContactInfo,
    string? PriceLevel,
    string[]? ServicesEn,
    string[]? ServicesAr,
    SuitabilityDto? Suitability
);

public record ReviewDto(
    string Id,
    string ItemType,
    string ItemId,
    string UserId,
    string UserName,
    double Rating,
    string Comment,
    DateTime CreatedAt
);

public record CreateReviewDto(
    string ItemType,
    string ItemId,
    double Rating,
    string? Comment
);

public record ReviewListResultDto(
    IReadOnlyList<ReviewDto> Items,
    int TotalCount,
    double AverageRating
);
