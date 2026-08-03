using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using Ldf.Application.Common;
using Ldf.Application.DTOs;
using Ldf.Application.Services;
using Ldf.Core;
using Ldf.Core.Entities;
using Ldf.Infrastructure.Data;

namespace Ldf.UnitTests;

public class ServicesTests
{
    private LdfDbContext GetInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<LdfDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new LdfDbContext(options);
    }

    [Fact]
    public void ArabicNormalizer_NormalizesVariousArabicCharactersCorrectly()
    {
        // Arrange
        var input = "أَحْمَدُ  في مَكَّةَ إِلى الرِّيَاضِ";

        // Act
        var result = ArabicNormalizer.Normalize(input);

        // Assert
        Assert.Equal("احمد في مكه الي الرياض", result);
    }

    [Fact]
    public async Task BookingService_CalculatesBasePriceAndVatCorrectly()
    {
        // Arrange
        using var context = GetInMemoryDbContext(Guid.NewGuid().ToString());
        var pkg = new Package
        {
            Id = "pkg_1",
            NameEn = "AlUla Hegra Tour",
            NameAr = "رحلة العلا الحجر",
            PricePerPerson = 400.0,
            TotalSeats = 20,
            RemainingSeats = 10
        };
        await context.Packages.AddAsync(pkg);
        await context.SaveChangesAsync();

        var notifService = new NotificationService(context);
        var bookingService = new BookingService(context);

        // Act - Book for 2 travelers
        var dto = new CreateBookingRequestDto("package", "pkg_1", 2);
        var booking = await bookingService.CreateBookingAsync("user_1", dto);

        // Assert
        Assert.Equal(800.0, booking.PriceDetails.BasePrice); // 400 * 2
        Assert.Equal(120.0, booking.PriceDetails.Taxes);     // 15% VAT of 800
        Assert.Equal(920.0, booking.PriceDetails.TotalPrice); // 800 + 120
        Assert.Equal(BookingStatuses.Pending, booking.Status);
    }

    [Fact]
    public async Task DestinationService_RejectsDuplicateReviewFromSameUser()
    {
        // Arrange
        using var context = GetInMemoryDbContext(Guid.NewGuid().ToString());
        var dest = new Destination { Id = "dest_1", NameEn = "Edge of the World", NameAr = "حافة العالم", CityId = "riyadh" };
        await context.Destinations.AddAsync(dest);
        await context.SaveChangesAsync();

        var destService = new DestinationService(context);

        var reviewDto = new CreateReviewDto("destination", "dest_1", 5.0, "Amazing spot!");
        await destService.AddReviewAsync("user_123", reviewDto);

        // Act & Assert - Adding review again from user_123 should throw ConflictException
        await Assert.ThrowsAsync<ConflictException>(() => destService.AddReviewAsync("user_123", reviewDto));
    }

    [Fact]
    public async Task DestinationService_ValidatesRatingRangeStrictly()
    {
        // Arrange
        using var context = GetInMemoryDbContext(Guid.NewGuid().ToString());
        var destService = new DestinationService(context);

        // Act & Assert - Rating 6 star should throw ValidationException
        var invalidReview = new CreateReviewDto("destination", "dest_1", 6.0, "Too good");
        await Assert.ThrowsAsync<ValidationException>(() => destService.AddReviewAsync("user_1", invalidReview));
    }

    [Fact]
    public async Task FavoriteService_RejectsDuplicateFavoriteItem()
    {
        // Arrange
        using var context = GetInMemoryDbContext(Guid.NewGuid().ToString());
        var favService = new FavoriteService(context);

        var dto = new AddFavoriteRequestDto("destination", "dest_100");
        await favService.AddFavoriteAsync("user_1", dto);

        // Act & Assert - Adding same favorite again should throw ConflictException
        await Assert.ThrowsAsync<ConflictException>(() => favService.AddFavoriteAsync("user_1", dto));
    }
}
