namespace Ldf.Core.Entities;

public class Activity
{
    public string Id { get; set; } = string.Empty;
    public string DestinationId { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public double PricePerPerson { get; set; }
    public int DurationMinutes { get; set; }

    public Destination? Destination { get; set; }
}
