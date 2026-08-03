using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ldf.Core.Interfaces;

public interface IOpenStreetMapService
{
    Task<IEnumerable<OsmPlaceDto>> SearchNearbyAsync(double latitude, double longitude, double radiusInMeters, string category, string language);
    Task<OsmPlaceDetailsDto?> GetPlaceDetailsAsync(string osmId, string language);
}

public class OsmPlaceDto
{
    public string Id { get; set; } = string.Empty;
    public string OSMId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public double DistanceKm { get; set; }
    public string OpeningHours { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Cuisine { get; set; } = string.Empty;
    public string Wheelchair { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
}

public class OsmPlaceDetailsDto
{
    public string Id { get; set; } = string.Empty;
    public string OSMId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
    public string Cuisine { get; set; } = string.Empty;
    public string Accessibility { get; set; } = string.Empty;
    public string[] Photos { get; set; } = System.Array.Empty<string>();
}
