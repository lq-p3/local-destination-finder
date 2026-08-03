namespace Ldf.Core.Entities;

public class TravelOffice
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Logo { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public string CitiesServedEnJson { get; set; } = "[]";
    public string CitiesServedArJson { get; set; } = "[]";
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WorkingHoursEn { get; set; } = string.Empty;
    public string WorkingHoursAr { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string TermsEn { get; set; } = string.Empty;
    public string TermsAr { get; set; } = string.Empty;
    public string CancellationPolicyEn { get; set; } = string.Empty;
    public string CancellationPolicyAr { get; set; } = string.Empty;

    public User? User { get; set; }
}
