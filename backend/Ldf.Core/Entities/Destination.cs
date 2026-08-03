using System.Collections.Generic;

namespace Ldf.Core.Entities;

public class Destination
{
    public string Id { get; set; } = string.Empty;
    public string CityId { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public double Rating { get; set; }
    public int ReviewsCount { get; set; }
    public string Image { get; set; } = string.Empty; // Backward compatibility
    public string GalleryJson { get; set; } = "[]"; // Backward compatibility
    public string MainImageId { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string WorkingHoursEn { get; set; } = string.Empty;
    public string WorkingHoursAr { get; set; } = string.Empty;
    public double EntryFees { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PriceLevel { get; set; } = string.Empty;
    public string ServicesEnJson { get; set; } = "[]";
    public string ServicesArJson { get; set; } = "[]";
    public bool FamiliesSuitability { get; set; }
    public bool KidsSuitability { get; set; }
    public bool ElderlySuitability { get; set; }
    public bool DisabledSuitability { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, PendingReview, Verified, Published
    public string SubmittedBy { get; set; } = string.Empty;
    public string DistanceEn { get; set; } = string.Empty;
    public string DistanceAr { get; set; } = string.Empty;

    public City? City { get; set; }
    public User? Submitter { get; set; }
    public ImageMetadata? MainImage { get; set; }
    public ICollection<ImageMetadata> Gallery { get; set; } = new List<ImageMetadata>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
