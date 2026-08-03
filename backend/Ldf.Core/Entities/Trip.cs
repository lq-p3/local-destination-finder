using System;
using System.Collections.Generic;

namespace Ldf.Core.Entities;

public class Trip
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public User? User { get; set; }

    public string Title { get; set; } = string.Empty;
    public string PrimaryCityId { get; set; } = "Abha";

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int DurationDays { get; set; } = 3;

    public string BudgetLevel { get; set; } = "Mid-range";
    public string Status { get; set; } = "planning"; // planning, active, completed, archived

    public List<TripDay> Days { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class TripDay
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TripId { get; set; } = string.Empty;
    public Trip? Trip { get; set; }

    public int DayNumber { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;

    public List<TripItem> Items { get; set; } = new();
}

public class TripItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TripDayId { get; set; } = string.Empty;
    public TripDay? TripDay { get; set; }

    public string TimeSlot { get; set; } = "09:00 AM";
    public string ItemType { get; set; } = "destination"; // destination, hotel, restaurant, cafe, activity, event
    public string ItemId { get; set; } = string.Empty;

    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;

    public string? Notes { get; set; }
    public int Order { get; set; } = 0;
}
