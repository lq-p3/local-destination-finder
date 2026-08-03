using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Ldf.Core.Interfaces;

namespace Ldf.Infrastructure.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
    }

    public async Task<string> GenerateTravelPlanJsonAsync(
        string[] cities,
        string budget,
        int daysCount,
        string[] interests,
        string tripType,
        string transport,
        string accommodation)
    {
        var prompt = $"Generate a comprehensive day-by-day travel plan for a tourist in Saudi Arabia visiting: {string.Join(", ", cities)} for {daysCount} days with a {budget} budget. Interests: {string.Join(", ", interests)}. Trip type: {tripType}. Transport: {transport}. Lodging: {accommodation}. " +
            "Return ONLY a raw JSON object conforming to the TypeScript schema: " +
            "interface Activity { time: string; textEn: string; textAr: string; estimatedCostSar: number } " +
            "interface ItineraryDay { dayNumber: number; activitiesEn: Activity[]; activitiesAr: Activity[] } " +
            "interface RecommendedHotel { nameEn: string; nameAr: string; pricePerNightSar: number; rating: number } " +
            "interface RecommendedRestaurant { nameEn: string; nameAr: string; typeEn: string; typeAr: string; avgCostPerPersonSar: number } " +
            "interface BudgetBreakdown { lodgingCostSar: number; transportCostSar: number; activitiesCostSar: number; foodCostSar: number; totalCostSar: number } " +
            "interface TravelPlan { days: ItineraryDay[]; hotels: RecommendedHotel[]; restaurants: RecommendedRestaurant[]; budgetBreakdown: BudgetBreakdown; routeSummaryEn: string; routeSummaryAr: string; } " +
            "Do NOT wrap in markdown formatting or write any explanations. Return only valid JSON object matching the TravelPlan interface.";

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return GetFallbackJson(daysCount);
        }

        try
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}", content);
            
            if (!response.IsSuccessStatusCode)
            {
                return GetFallbackJson(daysCount);
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseBody);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? string.Empty;

            text = text.Replace("```json", "").Replace("```", "").Trim();
            return text;
        }
        catch
        {
            return GetFallbackJson(daysCount);
        }
    }

    private string GetFallbackJson(int daysCount)
    {
        var days = new List<object>();
        for (int i = 1; i <= daysCount; i++)
        {
            days.Add(new
            {
                dayNumber = i,
                activitiesEn = new[]
                {
                    new { time = "09:00 AM", textEn = "Morning walk in historical city center and museums.", estimatedCostSar = 30 },
                    new { time = "01:00 PM", textEn = "Traditional lunch at recommended local restaurant.", estimatedCostSar = 75 },
                    new { time = "04:00 PM", textEn = "Afternoon nature sightseeing and sunset viewpoints.", estimatedCostSar = 0 }
                },
                activitiesAr = new[]
                {
                    new { time = "09:00 ص", textAr = "جولة مشي صباحية في وسط البلد التراثي والمتاحف.", estimatedCostSar = 30 },
                    new { time = "01:00 م", textAr = "وجبة غداء تراثية في مطعم شعبي موصى به.", estimatedCostSar = 75 },
                    new { time = "04:00 م", textAr = "جولة استكشافية طبيعية ومشاهدة الغروب من المطل.", estimatedCostSar = 0 }
                }
            });
        }

        var plan = new
        {
            days,
            hotels = new[]
            {
                new { nameEn = "Saudi Heritage Hotel", nameAr = "فندق التراث السعودي", pricePerNightSar = 350, rating = 4.8 },
                new { nameEn = "Desert Resort & Spa", nameAr = "منتجع وسبا الصحراء", pricePerNightSar = 600, rating = 4.6 }
            },
            restaurants = new[]
            {
                new { nameEn = "Najd Village Restaurant", nameAr = "مطعم القرية النجدية", typeEn = "Traditional", typeAr = "تراثي سعودي", avgCostPerPersonSar = 90 },
                new { nameEn = "Red Sea Grill", nameAr = "شواية البحر الأحمر", typeEn = "Seafood", typeAr = "مأكولات بحرية", avgCostPerPersonSar = 120 }
            },
            budgetBreakdown = new
            {
                lodgingCostSar = daysCount * 450,
                transportCostSar = daysCount * 150,
                activitiesCostSar = daysCount * 50,
                foodCostSar = daysCount * 180,
                totalCostSar = daysCount * 830
            },
            routeSummaryEn = "Optimized route starting from regional city hub covering highlights.",
            routeSummaryAr = "مسار رحلة مُحسّن يبدأ من مركز المدينة الإقليمي ويغطي أبرز المعالم السياحية."
        };

        return JsonSerializer.Serialize(plan);
    }
}
