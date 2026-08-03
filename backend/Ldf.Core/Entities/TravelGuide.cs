namespace Ldf.Core.Entities;

public class TravelGuide
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public string LanguagesEnJson { get; set; } = "[]";
    public string LanguagesArJson { get; set; } = "[]";
    public string SpecialtiesEnJson { get; set; } = "[]";
    public string SpecialtiesArJson { get; set; } = "[]";
    public string CitiesCoveredEnJson { get; set; } = "[]";
    public string CitiesCoveredArJson { get; set; } = "[]";
    public double PricePerHour { get; set; }
    public double PricePerDay { get; set; }
    public double Rating { get; set; }
    public int ReviewsCount { get; set; }
    public int YearsOfExperience { get; set; }
    public string Availability { get; set; } = "available";
    public string WorkingHoursEn { get; set; } = string.Empty;
    public string WorkingHoursAr { get; set; } = string.Empty;
    public string ServicesEnJson { get; set; } = "[]";
    public string ServicesArJson { get; set; } = "[]";
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public User? User { get; set; }
}
