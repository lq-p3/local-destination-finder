using System;

namespace Ldf.Core.Entities;

public class Cafe
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CityId { get; set; } = string.Empty;
    public City? City { get; set; }

    public string RegionId { get; set; } = string.Empty;
    public Region? Region { get; set; }

    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;

    public string DescriptionAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string AddressAr { get; set; } = string.Empty;
    public string AddressEn { get; set; } = string.Empty;

    public string ImagesJson { get; set; } = "[]";
    public double Rating { get; set; } = 4.5;
    public int ReviewsCount { get; set; } = 0;

    public string PriceLevel { get; set; } = "PRICE_LEVEL_MODERATE";
    public string OpeningHours { get; set; } = "07:00 AM - 12:00 AM";

    public bool OutdoorSeating { get; set; } = true;
    public bool FamilyFriendly { get; set; } = true;
    public bool WorkFriendly { get; set; } = true;

    public string? Phone { get; set; }
    public string? Website { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
