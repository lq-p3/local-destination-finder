using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Ldf.Core.Interfaces;

namespace Ldf.Infrastructure.Services;

public class OpenStreetMapService : IOpenStreetMapService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<OpenStreetMapService> _logger;

    public OpenStreetMapService(
        HttpClient httpClient, 
        IMemoryCache cache, 
        ILogger<OpenStreetMapService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<OsmPlaceDto>> SearchNearbyAsync(double latitude, double longitude, double radiusInMeters, string category, string language)
    {
        string cacheKey = $"osm_nearby_v3_{language}_{latitude}_{longitude}_{radiusInMeters}_{category}";
        if (_cache.TryGetValue(cacheKey, out IEnumerable<OsmPlaceDto>? cachedPlaces) && cachedPlaces != null)
        {
            _logger.LogInformation("Returning cached OSM results for key: {CacheKey}", cacheKey);
            return cachedPlaces;
        }

        try
        {
            string tagKey = category switch
            {
                "lodging" => "tourism",
                "restaurant" => "amenity",
                "cafe" => "amenity",
                _ => "tourism"
            };
            string tagValue = category switch
            {
                "lodging" => "hotel",
                "restaurant" => "restaurant",
                "cafe" => "cafe",
                _ => "hotel"
            };

            string query = $"[out:json][timeout:25];(node[{tagKey}={tagValue}](around:{radiusInMeters},{latitude},{longitude});way[{tagKey}={tagValue}](around:{radiusInMeters},{latitude},{longitude});relation[{tagKey}={tagValue}](around:{radiusInMeters},{latitude},{longitude}););out center;";
            
            var request = new HttpRequestMessage(HttpMethod.Post, "https://overpass-api.de/api/interpreter");
            request.Content = new StringContent($"data={Uri.EscapeDataString(query)}", System.Text.Encoding.UTF8, "application/x-www-form-urlencoded");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync();
                _logger.LogError("Overpass API error: {Status} - {Error}", response.StatusCode, err);
                throw new HttpRequestException($"Overpass API failed with status {response.StatusCode}");
            }

            var doc = await response.Content.ReadFromJsonAsync<JsonElement>();
            var list = new List<OsmPlaceDto>();

            if (doc.TryGetProperty("elements", out var elements) && elements.ValueKind == JsonValueKind.Array)
            {
                foreach (var el in elements.EnumerateArray())
                {
                    try
                    {
                        var type = el.GetProperty("type").GetString() ?? "node";
                        var idVal = el.GetProperty("id").GetRawText();
                        
                        string prefix = type.Substring(0, 1).ToUpper();
                        string osmId = $"{prefix}{idVal}";

                        double lat = 0;
                        double lon = 0;

                        if (type == "node")
                        {
                            lat = el.GetProperty("lat").GetDouble();
                            lon = el.GetProperty("lon").GetDouble();
                        }
                        else if (el.TryGetProperty("center", out var centerNode))
                        {
                            lat = centerNode.GetProperty("lat").GetDouble();
                            lon = centerNode.GetProperty("lon").GetDouble();
                        }
                        else
                        {
                            continue;
                        }

                        var tags = el.TryGetProperty("tags", out var tNode) ? tNode : default;
                        string name = "";
                        string website = "";
                        string phone = "";
                        string openingHours = "";
                        string cuisine = "";
                        string wheelchair = "";
                        string street = "";
                        string city = "";
                        string image = "";

                        if (tags.ValueKind == JsonValueKind.Object)
                        {
                            if (language == "ar" && tags.TryGetProperty("name:ar", out var nameAr))
                                name = nameAr.GetString() ?? "";
                            else if (tags.TryGetProperty("name:en", out var nameEn))
                                name = nameEn.GetString() ?? "";
                            
                            if (string.IsNullOrEmpty(name) && tags.TryGetProperty("name", out var nameGeneric))
                                name = nameGeneric.GetString() ?? "";

                            if (tags.TryGetProperty("website", out var web)) website = web.GetString() ?? "";
                            if (tags.TryGetProperty("phone", out var ph)) phone = ph.GetString() ?? "";
                            if (tags.TryGetProperty("opening_hours", out var hours)) openingHours = hours.GetString() ?? "";
                            if (tags.TryGetProperty("cuisine", out var cuis)) cuisine = cuis.GetString() ?? "";
                            if (tags.TryGetProperty("image", out var imgProp))
                                image = imgProp.GetString() ?? "";

                            if (string.IsNullOrEmpty(image) && tags.TryGetProperty("wikimedia_commons", out var wmProp))
                            {
                                string wm = wmProp.GetString() ?? "";
                                if (wm.StartsWith("File:"))
                                {
                                    string fileName = wm.Substring(5).Replace(" ", "_");
                                    image = $"https://commons.wikimedia.org/wiki/Special:FilePath/{fileName}?width=800";
                                }
                                else if (!string.IsNullOrEmpty(wm))
                                {
                                    image = $"https://commons.wikimedia.org/wiki/Special:FilePath/{wm.Replace(" ", "_")}?width=800";
                                }
                            }
                        }

                        if (string.IsNullOrEmpty(name))
                        {
                            // Skip places without a name
                            continue;
                        }

                        if (string.IsNullOrEmpty(image))
                        {
                            image = GetFallbackImage(category, name);
                        }

                        string address = string.IsNullOrEmpty(street) 
                            ? (string.IsNullOrEmpty(city) ? $"{lat:F4}, {lon:F4}" : city) 
                            : (string.IsNullOrEmpty(city) ? street : $"{street}, {city}");

                        double distance = CalculateDistance(latitude, longitude, lat, lon);

                        list.Add(new OsmPlaceDto
                        {
                            Id = osmId,
                            OSMId = osmId,
                            Name = name,
                            Latitude = lat,
                            Longitude = lon,
                            Address = address,
                            Category = category,
                            DistanceKm = Math.Round(distance, 2),
                            OpeningHours = openingHours,
                            Website = website,
                            Phone = phone,
                            Cuisine = cuisine,
                            Wheelchair = wheelchair,
                            Image = image
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error parsing individual OSM element.");
                    }
                }
            }

            list.Sort((a, b) => a.DistanceKm.CompareTo(b.DistanceKm));

            _cache.Set(cacheKey, list, TimeSpan.FromMinutes(15));
            return list;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Overpass search query failed safely without crashing UI.");
            return Array.Empty<OsmPlaceDto>();
        }
    }

    public async Task<OsmPlaceDetailsDto?> GetPlaceDetailsAsync(string osmId, string language)
    {
        string cacheKey = $"osm_details_{language}_{osmId}";
        if (_cache.TryGetValue(cacheKey, out OsmPlaceDetailsDto? cachedDetails) && cachedDetails != null)
        {
            return cachedDetails;
        }

        try
        {
            var requestUrl = $"https://nominatim.openstreetmap.org/lookup?osm_ids={osmId}&format=jsonv2&addressdetails=1&extratags=1";
            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Nominatim lookup failed: {Status}", response.StatusCode);
                return null;
            }

            var doc = await response.Content.ReadFromJsonAsync<List<JsonElement>>();
            if (doc == null || doc.Count == 0) return null;

            var el = doc[0];

            double lat = double.Parse(el.GetProperty("lat").GetString() ?? "0");
            double lon = double.Parse(el.GetProperty("lon").GetString() ?? "0");
            string address = el.TryGetProperty("display_name", out var dn) ? dn.GetString() ?? "" : "";

            var extratags = el.TryGetProperty("extratags", out var exTags) ? exTags : default;
            string name = "";
            string website = "";
            string phone = "";
            string openingHours = "";
            string cuisine = "";
            string wheelchair = "";

            if (el.TryGetProperty("address", out var addrNode) && addrNode.ValueKind == JsonValueKind.Object)
            {
                if (language == "ar" && addrNode.TryGetProperty("amenity:ar", out var nameAr))
                    name = nameAr.GetString() ?? "";
                else if (addrNode.TryGetProperty("amenity:en", out var nameEn))
                    name = nameEn.GetString() ?? "";
            }

            if (string.IsNullOrEmpty(name) && el.TryGetProperty("name", out var genericName))
            {
                name = genericName.GetString() ?? "";
            }

            if (string.IsNullOrEmpty(name))
            {
                name = language == "ar" ? "معلم سياحي" : "Tourist Spot";
            }

            if (extratags.ValueKind == JsonValueKind.Object)
            {
                if (extratags.TryGetProperty("website", out var web)) website = web.GetString() ?? "";
                if (extratags.TryGetProperty("phone", out var ph)) phone = ph.GetString() ?? "";
                if (extratags.TryGetProperty("opening_hours", out var hours)) openingHours = hours.GetString() ?? "";
                if (extratags.TryGetProperty("cuisine", out var cuis)) cuisine = cuis.GetString() ?? "";
                if (extratags.TryGetProperty("wheelchair", out var wheel)) wheelchair = wheel.GetString() ?? "";
            }

            var result = new OsmPlaceDetailsDto
            {
                Id = osmId,
                OSMId = osmId,
                Name = name,
                Address = address,
                Latitude = lat,
                Longitude = lon,
                Phone = phone,
                Website = website,
                OpeningHours = openingHours,
                Cuisine = cuisine,
                Accessibility = wheelchair,
                Photos = new[] { GetFallbackImage(el.TryGetProperty("type", out var typ) ? typ.GetString() ?? "" : "") }
            };

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(15));
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Nominatim detail query failed.");
            return null;
        }
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var r = 6371;
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return r * c;
    }

    private double ToRadians(double val) => (Math.PI / 180) * val;

    private static readonly string[] HotelImages = new[]
    {
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80"
    };

    private static readonly string[] RestaurantImages = new[]
    {
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80"
    };

    private static readonly string[] CafeImages = new[]
    {
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80"
    };

    private string GetFallbackImage(string category, string idOrName = "")
    {
        var n = (idOrName ?? "").ToLower();
        if (n.Contains("radisson") || n.Contains("راديسون")) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
        if (n.Contains("holiday") || n.Contains("هولدى") || n.Contains("هوليدي")) return "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80";
        if (n.Contains("sheraton") || n.Contains("شيراتون") || n.Contains("four points") || n.Contains("4 points")) return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80";
        if (n.Contains("hilton") || n.Contains("هيلتون")) return "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80";
        if (n.Contains("marriott") || n.Contains("ماريوت")) return "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";
        if (n.Contains("chalet") || n.Contains("شاليه") || n.Contains("sala") || n.Contains("منتجع")) return "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80";
        if (n.Contains("compound") || n.Contains("مجمع") || n.Contains("كمبوند") || n.Contains("درر")) return "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80";
        if (n.Contains("macsoora") || n.Contains("مقصورة") || n.Contains("قصر")) return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80";
        if (n.Contains("novotel") || n.Contains("نوفوتيل")) return "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80";
        if (n.Contains("boudl") || n.Contains("بودل") || n.Contains("شقق") || n.Contains("أجنحة") || n.Contains("rest inn")) return "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80";

        int hash = Math.Abs(string.IsNullOrEmpty(idOrName) ? 0 : idOrName.GetHashCode());
        var clean = category.ToLower();
        if (clean == "lodging" || clean == "hotel" || clean == "tourism")
        {
            return HotelImages[hash % HotelImages.Length];
        }
        if (clean == "restaurant" || clean == "fast_food" || clean == "food")
        {
            return RestaurantImages[hash % RestaurantImages.Length];
        }
        return CafeImages[hash % CafeImages.Length];
    }
}
