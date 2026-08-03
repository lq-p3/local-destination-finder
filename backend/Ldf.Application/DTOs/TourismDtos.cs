using System;
using System.Collections.Generic;

namespace Ldf.Application.DTOs;

public record RegionDto(
    string Id,
    string Slug,
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    string CoverImage,
    double Latitude,
    double Longitude,
    string BestTimeToVisitAr,
    string BestTimeToVisitEn,
    List<string> FamousFoods,
    int CitiesCount,
    int DestinationsCount
);

public record CityDto(
    string Id,
    string Slug,
    string RegionId,
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    string CoverImage,
    double Latitude,
    double Longitude,
    string WeatherSummary,
    string BestTimeToVisit
);

public record ActivityDto(
    string Id,
    string CityId,
    string RegionId,
    string NameAr,
    string NameEn,
    string Category,
    int DurationMinutes,
    double Price,
    string Difficulty,
    string Image,
    bool BookingAvailable
);

public record PackageDto(
    string Id,
    string ProviderId,
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    double PricePerPerson,
    double OriginalPrice,
    string Currency,
    int DurationDays,
    int DurationNights,
    int MaxTravelers,
    int AvailableSeats,
    string Image,
    double Rating,
    int ReviewsCount,
    string Category,
    string IncludedServices,
    string Status
);

public record TravelOfficeDto(
    string Id,
    string NameAr,
    string NameEn,
    string Logo,
    string LicenseNumber,
    double Rating,
    bool Verified,
    string Phone,
    string Email
);

public record TravelGuideDto(
    string Id,
    string NameAr,
    string NameEn,
    string Photo,
    double Rating,
    double PricePerDay,
    bool Verified,
    string BioAr
);

public record UnifiedPlaceDto(
    string Id,
    string PlaceType, // destination, hotel, restaurant, cafe, activity, event
    string CityId,
    string RegionId,
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    double Latitude,
    double Longitude,
    string Image,
    double Rating,
    int ReviewsCount,
    string PriceLevel,
    string AddressAr,
    string AddressEn,
    string? Phone,
    string? Website,
    string OpeningHours,
    double DistanceKm = 0.0
);

public record CityTourismHubDto(
    CityDto City,
    List<DestinationDto> TopDestinations,
    List<HotelDto> Hotels,
    List<RestaurantDto> Restaurants,
    List<CafeDto> Cafes,
    List<ActivityDto> Activities,
    List<EventDto> Events,
    List<PackageDto> Packages,
    List<TravelOfficeDto> Offices
);

public record HotelDto(
    string Id,
    string CityId,
    string RegionId,
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    int Stars,
    double Rating,
    int ReviewsCount,
    double PriceFrom,
    double Latitude,
    double Longitude,
    List<string> Amenities,
    string Image,
    string CheckIn,
    string CheckOut,
    string? Phone,
    string? Website,
    string Address
);

public record RestaurantDto(
    string Id,
    string CityId,
    string RegionId,
    string NameAr,
    string NameEn,
    string CuisineAr,
    string CuisineEn,
    double Rating,
    int ReviewsCount,
    string PriceLevel,
    double Latitude,
    double Longitude,
    string Image,
    string OpeningHours,
    bool FamilyFriendly,
    bool Delivery,
    bool ReservationRequired
);

public record CafeDto(
    string Id,
    string CityId,
    string RegionId,
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    double Rating,
    int ReviewsCount,
    string PriceLevel,
    double Latitude,
    double Longitude,
    string Image,
    string OpeningHours,
    bool OutdoorSeating,
    bool FamilyFriendly,
    bool WorkFriendly
);

public record EventDto(
    string Id,
    string CityId,
    string RegionId,
    string NameAr,
    string NameEn,
    string DescriptionAr,
    string DescriptionEn,
    DateTime StartDate,
    DateTime EndDate,
    string VenueAr,
    string VenueEn,
    double Latitude,
    double Longitude,
    string Category,
    double Price,
    string Organizer,
    string Image,
    string Status
);
