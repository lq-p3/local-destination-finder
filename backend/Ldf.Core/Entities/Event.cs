using System;

namespace Ldf.Core.Entities;

public class Event
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

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public string VenueAr { get; set; } = string.Empty;
    public string VenueEn { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string Category { get; set; } = "Festival";
    public double Price { get; set; } = 0.0; // 0 means Free Entry
    public string Organizer { get; set; } = "General Entertainment Authority";

    public string? BookingUrl { get; set; }
    public string Image { get; set; } = string.Empty;

    public string Status { get; set; } = "upcoming"; // upcoming, ongoing, completed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
