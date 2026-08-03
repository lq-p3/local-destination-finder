using System.Collections.Generic;

namespace Ldf.Core.Entities;

public class Hotel
{
    public string Id { get; set; } = string.Empty;
    public string CityId { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string AddressEn { get; set; } = string.Empty;
    public string AddressAr { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public int Stars { get; set; }
    public double Rating { get; set; }
    public string PriceRange { get; set; } = string.Empty;
    public string MainImageId { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string ExternalBookingUrl { get; set; } = string.Empty;

    public City? City { get; set; }
    public ImageMetadata? MainImage { get; set; }
    public ICollection<ImageMetadata> Gallery { get; set; } = new List<ImageMetadata>();
}
