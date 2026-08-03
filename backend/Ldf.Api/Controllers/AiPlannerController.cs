using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Interfaces;
using Ldf.Core.Interfaces;

namespace Ldf.Api.Controllers;

[ApiController]
[Route("api/chat/planner")]
public class AiPlannerController : ControllerBase
{
    private readonly IGeminiService _geminiService;
    private readonly ILdfDbContext _context;

    public AiPlannerController(IGeminiService geminiService, ILdfDbContext context)
    {
        _geminiService = geminiService;
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> GetItinerary([FromBody] PlannerRequest request)
    {
        if (request.Cities == null || request.Cities.Length == 0)
        {
            return BadRequest(new { error = "At least one city is required." });
        }

        try
        {
            var resultJson = await _geminiService.GenerateTravelPlanJsonAsync(
                request.Cities,
                request.Budget ?? "medium",
                request.DaysCount > 0 ? request.DaysCount : 3,
                request.Interests ?? new string[] { "nature" },
                request.TripType ?? "family",
                request.Transport ?? "car",
                request.Accommodation ?? "hotel");

            using var doc = System.Text.Json.JsonDocument.Parse(resultJson);
            return Ok(new { success = true, itinerary = doc.RootElement });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AiPlannerController] Gemini AI generated plan failed/timed out, using rule-based DB fallback: {ex.Message}");
            
            // Rule-based Fallback using actual DB Destinations for requested city
            var targetCity = request.Cities.FirstOrDefault() ?? "Abha";
            var realPlaces = await _context.Destinations
                .AsNoTracking()
                .Where(d => d.CityId == targetCity || d.City!.NameAr.Contains(targetCity) || d.City!.NameEn.Contains(targetCity))
                .Take(9)
                .ToListAsync();

            var daysCount = request.DaysCount > 0 ? Math.Min(request.DaysCount, 5) : 3;
            var planDays = new List<object>();

            for (int day = 1; day <= daysCount; day++)
            {
                var dayPlaces = realPlaces.Skip((day - 1) * 2).Take(2).ToList();
                planDays.Add(new
                {
                    dayNumber = day,
                    titleAr = $"اليوم {day}: استكشاف المعالم السياحية والطبيعة",
                    titleEn = $"Day {day}: Sightseeing & Highlights",
                    activities = dayPlaces.Select((p, idx) => new
                    {
                        time = idx == 0 ? "10:00 AM" : "04:30 PM",
                        placeId = p.Id,
                        nameAr = p.NameAr,
                        nameEn = p.NameEn,
                        category = p.Category,
                        descriptionAr = p.DescriptionAr,
                        descriptionEn = p.DescriptionEn
                    })
                });
            }

            return Ok(new
            {
                success = true,
                isFallback = true,
                itinerary = new
                {
                    tripTitleAr = $"مخطط الرحلة المصمم لـ {targetCity}",
                    tripTitleEn = $"Customized Travel Itinerary for {targetCity}",
                    days = planDays
                }
            });
        }
    }
}

public record PlannerRequest(
    string[] Cities,
    string? Budget,
    int DaysCount,
    string[]? Interests,
    string? TripType,
    string? Transport,
    string? Accommodation
);
