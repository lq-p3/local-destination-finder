using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Ldf.Core.Interfaces;

namespace Ldf.Api.Controllers;

[ApiController]
[Route("api/places")]
public class PlacesController : ControllerBase
{
    private readonly IOpenStreetMapService _osmService;

    public PlacesController(IOpenStreetMapService osmService)
    {
        _osmService = osmService;
    }

    [HttpGet("nearby-hotels")]
    public async Task<IActionResult> GetNearbyHotels(
        [FromQuery] double latitude, 
        [FromQuery] double longitude, 
        [FromQuery] double? radius, 
        [FromQuery] string? language)
    {
        var lang = GetValidatedLanguage(language);
        if (lang == null) return BadRequest(new { error = "Language must be 'ar' or 'en'." });

        if (latitude < -90 || latitude > 90) return BadRequest(new { error = "Latitude must be between -90 and 90." });
        if (longitude < -180 || longitude > 180) return BadRequest(new { error = "Longitude must be between -180 and 180." });
        
        double radiusInMeters = radius ?? 5000;
        if (radiusInMeters < 1 || radiusInMeters > 50000) return BadRequest(new { error = "Radius must be between 1 and 50,000 meters." });

        try
        {
            var hotels = await _osmService.SearchNearbyAsync(latitude, longitude, radiusInMeters, "lodging", lang);
            return Ok(hotels);
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { code = "OSM_SERVICE_UNAVAILABLE", message = "OpenStreetMap / Overpass API is temporarily unavailable.", details = ex.Message });
        }
    }

    [HttpGet("nearby-restaurants")]
    public async Task<IActionResult> GetNearbyRestaurants(
        [FromQuery] double latitude, 
        [FromQuery] double longitude, 
        [FromQuery] double? radius, 
        [FromQuery] string? language)
    {
        var lang = GetValidatedLanguage(language);
        if (lang == null) return BadRequest(new { error = "Language must be 'ar' or 'en'." });

        if (latitude < -90 || latitude > 90) return BadRequest(new { error = "Latitude must be between -90 and 90." });
        if (longitude < -180 || longitude > 180) return BadRequest(new { error = "Longitude must be between -180 and 180." });
        
        double radiusInMeters = radius ?? 5000;
        if (radiusInMeters < 1 || radiusInMeters > 50000) return BadRequest(new { error = "Radius must be between 1 and 50,000 meters." });

        try
        {
            var restaurants = await _osmService.SearchNearbyAsync(latitude, longitude, radiusInMeters, "restaurant", lang);
            return Ok(restaurants);
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { code = "OSM_SERVICE_UNAVAILABLE", message = "OpenStreetMap / Overpass API is temporarily unavailable.", details = ex.Message });
        }
    }

    [HttpGet("nearby-cafes")]
    public async Task<IActionResult> GetNearbyCafes(
        [FromQuery] double latitude, 
        [FromQuery] double longitude, 
        [FromQuery] double? radius, 
        [FromQuery] string? language)
    {
        var lang = GetValidatedLanguage(language);
        if (lang == null) return BadRequest(new { error = "Language must be 'ar' or 'en'." });

        if (latitude < -90 || latitude > 90) return BadRequest(new { error = "Latitude must be between -90 and 90." });
        if (longitude < -180 || longitude > 180) return BadRequest(new { error = "Longitude must be between -180 and 180." });
        
        double radiusInMeters = radius ?? 5000;
        if (radiusInMeters < 1 || radiusInMeters > 50000) return BadRequest(new { error = "Radius must be between 1 and 50,000 meters." });

        try
        {
            var cafes = await _osmService.SearchNearbyAsync(latitude, longitude, radiusInMeters, "cafe", lang);
            return Ok(cafes);
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { code = "OSM_SERVICE_UNAVAILABLE", message = "OpenStreetMap / Overpass API is temporarily unavailable.", details = ex.Message });
        }
    }

    [HttpGet("details/{osmId}")]
    public async Task<IActionResult> GetPlaceDetails(string osmId, [FromQuery] string? language)
    {
        if (string.IsNullOrWhiteSpace(osmId))
        {
            return BadRequest(new { error = "OSM ID cannot be empty." });
        }

        var lang = GetValidatedLanguage(language);
        if (lang == null) return BadRequest(new { error = "Language must be 'ar' or 'en'." });

        try
        {
            var place = await _osmService.GetPlaceDetailsAsync(osmId, lang);
            if (place == null) return NotFound(new { error = "Place not found in OpenStreetMap." });
            return Ok(place);
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { code = "OSM_SERVICE_UNAVAILABLE", message = "OpenStreetMap / Nominatim lookup is temporarily unavailable.", details = ex.Message });
        }
    }

    private string? GetValidatedLanguage(string? language)
    {
        if (string.IsNullOrEmpty(language)) return "ar";
        var clean = language.Trim().ToLower();
        if (clean == "ar" || clean == "en") return clean;
        return null;
    }
}
