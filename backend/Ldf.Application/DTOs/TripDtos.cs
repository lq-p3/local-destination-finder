using System;
using System.Collections.Generic;

namespace Ldf.Application.DTOs;

public record CreateTripRequestDto(
    string Title,
    string PrimaryCityId,
    int DurationDays = 3,
    string BudgetLevel = "Mid-range",
    DateTime? StartDate = null
);

public record AddTripItemRequestDto(
    int DayNumber,
    string TimeSlot,
    string ItemType, // destination, hotel, restaurant, cafe, activity, event
    string ItemId,
    string TitleAr,
    string TitleEn,
    string? Notes = null
);

public record TripDetailDto(
    string Id,
    string UserId,
    string Title,
    string PrimaryCityId,
    int DurationDays,
    string BudgetLevel,
    string Status,
    DateTime? StartDate,
    DateTime? EndDate,
    List<TripDayDto> Days,
    DateTime CreatedAt
);

public record TripDayDto(
    string Id,
    int DayNumber,
    string TitleAr,
    string TitleEn,
    List<TripItemDto> Items
);

public record TripItemDto(
    string Id,
    string TimeSlot,
    string ItemType,
    string ItemId,
    string TitleAr,
    string TitleEn,
    string? Notes,
    int Order
);
