using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Ldf.Core.Entities;
using Ldf.Core.Interfaces;

namespace Ldf.Api.Controllers;

[ApiController]
[Route("api/packages")]
public class PackagesController : ControllerBase
{
    private readonly IRepository<Package> _packageRepository;

    public PackagesController(IRepository<Package> packageRepository)
    {
        _packageRepository = packageRepository;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? category, [FromQuery] string? search)
    {
        var packages = await _packageRepository.GetAllAsync();
        var query = packages.Where(p => p.IsAvailable);

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.NameEn.ToLower().Contains(s) || p.NameAr.ToLower().Contains(s));
        }

        var result = query.Select(p => MapToPackageResponse(p));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var p = await _packageRepository.GetByIdAsync(id);
        if (p == null || !p.IsAvailable)
        {
            return NotFound(new { error = "Package not found." });
        }

        return Ok(MapToPackageResponse(p));
    }

    [HttpPost("compare")]
    public async Task<IActionResult> Compare([FromBody] ComparePackagesRequest request)
    {
        if (request.PackageIds == null || request.PackageIds.Length < 2 || request.PackageIds.Length > 4)
        {
            return BadRequest(new { error = "Must specify between 2 and 4 package IDs to compare." });
        }

        var distinctIds = request.PackageIds.Distinct().ToList();
        var allPackages = await _packageRepository.GetAllAsync();
        var matched = allPackages.Where(p => p.IsAvailable && distinctIds.Contains(p.Id)).ToList();

        var result = matched.Select(p => MapToPackageResponse(p));
        return Ok(new { packages = result });
    }

    private static object MapToPackageResponse(Package p)
    {
        return new
        {
            id = p.Id,
            officeId = p.OfficeId,
            officeNameEn = p.OfficeNameEn,
            officeNameAr = p.OfficeNameAr,
            nameEn = p.NameEn,
            nameAr = p.NameAr,
            category = p.Category,
            images = System.Text.Json.JsonSerializer.Deserialize<string[]>(p.ImagesJson) ?? Array.Empty<string>(),
            citiesEn = System.Text.Json.JsonSerializer.Deserialize<string[]>(p.CitiesEnJson) ?? Array.Empty<string>(),
            citiesAr = System.Text.Json.JsonSerializer.Deserialize<string[]>(p.CitiesArJson) ?? Array.Empty<string>(),
            durationDays = p.DurationDays,
            startDate = p.StartDate,
            endDate = p.EndDate,
            itinerary = System.Text.Json.JsonSerializer.Deserialize<object[]>(p.ItineraryJson) ?? Array.Empty<object>(),
            transportTypeEn = p.TransportTypeEn,
            transportTypeAr = p.TransportTypeAr,
            pricePerPerson = p.PricePerPerson,
            currency = "SAR",
            totalSeats = p.TotalSeats,
            remainingSeats = p.RemainingSeats,
            inclusionsEn = System.Text.Json.JsonSerializer.Deserialize<string[]>(p.InclusionsEnJson) ?? Array.Empty<string>(),
            inclusionsAr = System.Text.Json.JsonSerializer.Deserialize<string[]>(p.InclusionsArJson) ?? Array.Empty<string>(),
            exclusionsEn = System.Text.Json.JsonSerializer.Deserialize<string[]>(p.ExclusionsEnJson) ?? Array.Empty<string>(),
            exclusionsAr = System.Text.Json.JsonSerializer.Deserialize<string[]>(p.ExclusionsArJson) ?? Array.Empty<string>(),
            termsEn = p.TermsEn,
            termsAr = p.TermsAr,
            cancellationPolicyEn = p.CancellationPolicyEn,
            cancellationPolicyAr = p.CancellationPolicyAr,
            rating = p.Rating,
            reviewsCount = p.ReviewsCount,
            isAvailable = p.IsAvailable
        };
    }
}

public record ComparePackagesRequest(string[] PackageIds);
