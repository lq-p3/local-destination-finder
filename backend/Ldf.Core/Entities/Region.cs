using System.Collections.Generic;

namespace Ldf.Core.Entities;

public class Region
{
    public string Id { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string CoverImage { get; set; } = string.Empty; // Backward compatibility
    public string CoverImageId { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string BestTimeToVisitEn { get; set; } = string.Empty;
    public string BestTimeToVisitAr { get; set; } = string.Empty;
    public string FamousFoodsEnJson { get; set; } = "[]"; // Backward compatibility
    public string FamousFoodsArJson { get; set; } = "[]"; // Backward compatibility

    public ImageMetadata? CoverImageEntity { get; set; }
    public ICollection<ImageMetadata> Gallery { get; set; } = new List<ImageMetadata>();
    public ICollection<City> Cities { get; set; } = new List<City>();
}
