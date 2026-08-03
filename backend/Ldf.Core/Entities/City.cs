using System.Collections.Generic;

namespace Ldf.Core.Entities;

public class City
{
    public string Id { get; set; } = string.Empty;
    public string RegionId { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string BestTimeToVisit { get; set; } = "October to March";
    public string WeatherSummary => $"{Temp}°C - {WeatherStatusAr}";
    public string CoverImage { get; set; } = string.Empty; // Backward compatibility
    public string CoverImageId { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int Temp { get; set; }
    public string WeatherStatusEn { get; set; } = string.Empty;
    public string WeatherStatusAr { get; set; } = string.Empty;
    public double WindSpeed { get; set; }

    public Region? Region { get; set; }
    public ImageMetadata? CoverImageEntity { get; set; }
    public ICollection<ImageMetadata> Gallery { get; set; } = new List<ImageMetadata>();
    public ICollection<Destination> Destinations { get; set; } = new List<Destination>();
    public ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
    public ICollection<Restaurant> Restaurants { get; set; } = new List<Restaurant>();
}
