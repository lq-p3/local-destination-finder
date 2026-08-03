using System.Threading.Tasks;

namespace Ldf.Core.Interfaces;

public interface IGeminiService
{
    Task<string> GenerateTravelPlanJsonAsync(
        string[] cities,
        string budget,
        int daysCount,
        string[] interests,
        string tripType,
        string transport,
        string accommodation);
}
