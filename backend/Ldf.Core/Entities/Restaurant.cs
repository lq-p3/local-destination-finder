using System.Collections.Generic;

namespace Ldf.Core.Entities;

public class Restaurant
{
    public string Id { get; set; } = string.Empty;
    public string CityId { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string CuisineEn { get; set; } = string.Empty;
    public string CuisineAr { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string AddressEn { get; set; } = string.Empty;
    public string AddressAr { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public double Rating { get; set; }
    public string PriceLevel { get; set; } = string.Empty;
    public string MainImageId { get; set; } = string.Empty;

    public City? City { get; set; }
    public ImageMetadata? MainImage { get; set; }
    public ICollection<ImageMetadata> Gallery { get; set; } = new List<ImageMetadata>();
}
