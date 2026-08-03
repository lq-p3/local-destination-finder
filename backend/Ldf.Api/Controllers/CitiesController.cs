using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;

namespace Ldf.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitiesController : ControllerBase
{
    private readonly ILdfDbContext _context;

    public CitiesController(ILdfDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var cities = await _context.Cities.AsNoTracking().ToListAsync(cancellationToken);
        var dtos = cities.Select(c => new CityDto(
            c.Id, c.Slug, c.RegionId, c.NameAr, c.NameEn, c.DescriptionAr, c.DescriptionEn, c.CoverImage, c.Latitude, c.Longitude, c.WeatherSummary, c.BestTimeToVisit
        ));
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken cancellationToken)
    {
        var city = await _context.Cities
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id || c.Slug == id, cancellationToken);

        if (city == null) return NotFound(new { error = "City not found" });

        var dests = await _context.Destinations.AsNoTracking().Where(d => d.CityId == city.Id).ToListAsync(cancellationToken);
        var hotels = await _context.Hotels.AsNoTracking().Where(h => h.CityId == city.Id).ToListAsync(cancellationToken);
        var cafes = await _context.Cafes.AsNoTracking().Where(c => c.CityId == city.Id).ToListAsync(cancellationToken);
        var events = await _context.Events.AsNoTracking().Where(e => e.CityId == city.Id).ToListAsync(cancellationToken);
        var pkgs = await _context.Packages.AsNoTracking().Where(p => p.CitiesArJson.Contains(city.NameAr) || p.CitiesEnJson.Contains(city.NameEn)).ToListAsync(cancellationToken);

        var cityDto = new CityDto(
            city.Id, city.Slug, city.RegionId, city.NameAr, city.NameEn, city.DescriptionAr, city.DescriptionEn, city.CoverImage, city.Latitude, city.Longitude, city.WeatherSummary, city.BestTimeToVisit
        );

        var destDtos = dests.Select(d => new DestinationDto(d.Id, d.CityId, d.NameEn, d.NameAr, d.Category, d.Rating, d.ReviewsCount, d.Image, Array.Empty<string>(), d.DescriptionEn, d.DescriptionAr, new CoordinatesDto(d.Latitude, d.Longitude), d.WorkingHoursEn, d.WorkingHoursAr, d.EntryFees, new ContactInfoDto(d.Phone, d.Email), d.PriceLevel, Array.Empty<string>(), Array.Empty<string>(), new SuitabilityDto(d.FamiliesSuitability, d.KidsSuitability, d.ElderlySuitability, d.DisabledSuitability), d.Status, d.SubmittedBy, d.DistanceEn, d.DistanceAr)).ToList();
        var hotelDtos = hotels.Select(h => new HotelDto(h.Id, h.CityId, city.RegionId, h.NameAr, h.NameEn, h.DescriptionAr, h.DescriptionEn, h.Stars, h.Rating, 12, 450.0, h.Latitude, h.Longitude, new(), h.MainImageId, "14:00", "12:00", h.Phone, h.Website, h.AddressAr)).ToList();
        var cafeDtos = cafes.Select(c => new CafeDto(c.Id, c.CityId, c.RegionId, c.NameAr, c.NameEn, c.DescriptionAr, c.DescriptionEn, c.Rating, c.ReviewsCount, c.PriceLevel, c.Latitude, c.Longitude, c.ImagesJson, c.OpeningHours, c.OutdoorSeating, c.FamilyFriendly, c.WorkFriendly)).ToList();
        var eventDtos = events.Select(e => new EventDto(e.Id, e.CityId, e.RegionId, e.NameAr, e.NameEn, e.DescriptionAr, e.DescriptionEn, e.StartDate, e.EndDate, e.VenueAr, e.VenueEn, e.Latitude, e.Longitude, e.Category, e.Price, e.Organizer, e.Image, e.Status)).ToList();
        var pkgDtos = pkgs.Select(p => new PackageDto(p.Id, p.OfficeId, p.NameAr, p.NameEn, "", "", p.PricePerPerson, p.PricePerPerson * 1.2, "SAR", p.DurationDays, p.DurationDays - 1, p.TotalSeats, p.AvailableSeats, "", p.Rating, p.ReviewsCount, p.Category, p.InclusionsArJson, "Published")).ToList();

        var hub = new CityTourismHubDto(
            cityDto,
            destDtos,
            hotelDtos,
            new(),
            cafeDtos,
            new(),
            eventDtos,
            pkgDtos,
            new()
        );

        return Ok(hub);
    }
}
