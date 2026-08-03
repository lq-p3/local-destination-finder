using System;
using System.Collections.Generic;

namespace Ldf.Core.Entities;

public class PackageDay
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PackageId { get; set; } = string.Empty;
    public Package? Package { get; set; }

    public int DayNumber { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;

    public string DescriptionAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;

    public List<PackageDayItem> Items { get; set; } = new();
}

public class PackageDayItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PackageDayId { get; set; } = string.Empty;
    public PackageDay? PackageDay { get; set; }

    public string TimeSlot { get; set; } = "09:00 AM";
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;

    public string ItemType { get; set; } = "activity"; // destination, hotel, restaurant, activity, transport
    public string? RelatedItemId { get; set; }

    public int Order { get; set; } = 0;
}
