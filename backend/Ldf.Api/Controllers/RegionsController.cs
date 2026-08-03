using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Ldf.Core.Entities;
using Ldf.Core.Interfaces;

namespace Ldf.Api.Controllers;

[ApiController]
[Route("api/regions")]
public class RegionsController : ControllerBase
{
    private readonly IRepository<Region> _regionRepository;
    private readonly IRepository<City> _cityRepository;

    public RegionsController(IRepository<Region> regionRepository, IRepository<City> cityRepository)
    {
        _regionRepository = regionRepository;
        _cityRepository = cityRepository;
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var regions = await _regionRepository.GetAllAsync();
        var result = regions.Select(r => new {
            id = r.Id,
            nameEn = r.NameEn,
            nameAr = r.NameAr,
            coverImage = !string.IsNullOrEmpty(r.CoverImage) ? r.CoverImage : "/alula_hegra.jpg",
            descriptionEn = r.DescriptionEn,
            descriptionAr = r.DescriptionAr,
            bestTimeToVisitEn = r.BestTimeToVisitEn,
            bestTimeToVisitAr = r.BestTimeToVisitAr,
            famousFoodsEn = System.Text.Json.JsonSerializer.Deserialize<string[]>(r.FamousFoodsEnJson) ?? Array.Empty<string>(),
            famousFoodsAr = System.Text.Json.JsonSerializer.Deserialize<string[]>(r.FamousFoodsArJson) ?? Array.Empty<string>()
        });
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var r = await _regionRepository.GetByIdAsync(id);
        if (r == null) return NotFound(new { error = "Region not found" });

        var allCities = await _cityRepository.GetAllAsync();
        var regionCities = allCities.Where(c => c.RegionId == r.Id).Select(c => new {
            id = c.Id,
            regionId = c.RegionId,
            nameEn = c.NameEn,
            nameAr = c.NameAr,
            coverImage = c.CoverImage,
            descriptionEn = c.DescriptionEn,
            descriptionAr = c.DescriptionAr,
            weather = new {
                temp = c.Temp,
                statusEn = c.WeatherStatusEn,
                statusAr = c.WeatherStatusAr,
                wind = c.WindSpeed + " km/h"
            },
            coordinates = new {
                lat = c.Latitude,
                lng = c.Longitude
            }
        }).ToList();

        var regionDto = new {
            id = r.Id,
            nameEn = r.NameEn,
            nameAr = r.NameAr,
            coverImage = r.CoverImage,
            descriptionEn = r.DescriptionEn,
            descriptionAr = r.DescriptionAr,
            bestTimeToVisitEn = r.BestTimeToVisitEn,
            bestTimeToVisitAr = r.BestTimeToVisitAr,
            famousFoodsEn = System.Text.Json.JsonSerializer.Deserialize<string[]>(r.FamousFoodsEnJson) ?? Array.Empty<string>(),
            famousFoodsAr = System.Text.Json.JsonSerializer.Deserialize<string[]>(r.FamousFoodsArJson) ?? Array.Empty<string>()
        };

        return Ok(new { region = regionDto, cities = regionCities });
    }
}

