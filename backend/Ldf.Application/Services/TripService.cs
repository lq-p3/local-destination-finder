using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Application.Common;
using Ldf.Application.DTOs;
using Ldf.Application.Interfaces;
using Ldf.Core.Entities;

namespace Ldf.Application.Services;

public interface ITripService
{
    Task<List<TripDetailDto>> GetUserTripsAsync(string userId, CancellationToken cancellationToken = default);
    Task<TripDetailDto> GetTripByIdAsync(string tripId, string userId, CancellationToken cancellationToken = default);
    Task<TripDetailDto> CreateTripAsync(string userId, CreateTripRequestDto request, CancellationToken cancellationToken = default);
    Task<TripDetailDto> AddTripItemAsync(string tripId, string userId, AddTripItemRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteTripAsync(string tripId, string userId, CancellationToken cancellationToken = default);
}

public class TripService : ITripService
{
    private readonly ILdfDbContext _context;

    public TripService(ILdfDbContext context)
    {
        _context = context;
    }

    public async Task<List<TripDetailDto>> GetUserTripsAsync(string userId, CancellationToken cancellationToken = default)
    {
        var trips = await _context.Trips
            .AsNoTracking()
            .Include(t => t.Days)
                .ThenInclude(d => d.Items)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return trips.Select(MapTripToDto).ToList();
    }

    public async Task<TripDetailDto> GetTripByIdAsync(string tripId, string userId, CancellationToken cancellationToken = default)
    {
        var trip = await _context.Trips
            .AsNoTracking()
            .Include(t => t.Days)
                .ThenInclude(d => d.Items)
            .FirstOrDefaultAsync(t => t.Id == tripId, cancellationToken);

        if (trip == null)
            throw new NotFoundException($"Trip with ID '{tripId}' was not found.");

        if (trip.UserId != userId)
            throw new ForbiddenException("You do not have permission to view this trip.");

        return MapTripToDto(trip);
    }

    public async Task<TripDetailDto> CreateTripAsync(string userId, CreateTripRequestDto request, CancellationToken cancellationToken = default)
    {
        var trip = new Trip
        {
            UserId = userId,
            Title = request.Title,
            PrimaryCityId = request.PrimaryCityId,
            DurationDays = request.DurationDays,
            BudgetLevel = request.BudgetLevel,
            StartDate = request.StartDate,
            EndDate = request.StartDate?.AddDays(request.DurationDays),
            Status = "planning"
        };

        for (int i = 1; i <= Math.Min(14, request.DurationDays); i++)
        {
            trip.Days.Add(new TripDay
            {
                DayNumber = i,
                TitleAr = $"اليوم {i}: استكشاف المعالم والأنشطة",
                TitleEn = $"Day {i}: Highlights & Exploration"
            });
        }

        await _context.Trips.AddAsync(trip, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return MapTripToDto(trip);
    }

    public async Task<TripDetailDto> AddTripItemAsync(string tripId, string userId, AddTripItemRequestDto request, CancellationToken cancellationToken = default)
    {
        var trip = await _context.Trips
            .Include(t => t.Days)
                .ThenInclude(d => d.Items)
            .FirstOrDefaultAsync(t => t.Id == tripId, cancellationToken);

        if (trip == null)
            throw new NotFoundException($"Trip with ID '{tripId}' was not found.");

        if (trip.UserId != userId)
            throw new ForbiddenException("You do not have permission to modify this trip.");

        var day = trip.Days.FirstOrDefault(d => d.DayNumber == request.DayNumber);
        if (day == null)
        {
            day = new TripDay
            {
                TripId = trip.Id,
                DayNumber = request.DayNumber,
                TitleAr = $"اليوم {request.DayNumber}",
                TitleEn = $"Day {request.DayNumber}"
            };
            trip.Days.Add(day);
        }

        day.Items.Add(new TripItem
        {
            TimeSlot = request.TimeSlot,
            ItemType = request.ItemType,
            ItemId = request.ItemId,
            TitleAr = request.TitleAr,
            TitleEn = request.TitleEn,
            Notes = request.Notes,
            Order = day.Items.Count + 1
        });

        await _context.SaveChangesAsync(cancellationToken);
        return MapTripToDto(trip);
    }

    public async Task<bool> DeleteTripAsync(string tripId, string userId, CancellationToken cancellationToken = default)
    {
        var trip = await _context.Trips.FirstOrDefaultAsync(t => t.Id == tripId, cancellationToken);
        if (trip == null) return false;

        if (trip.UserId != userId)
            throw new ForbiddenException("You do not have permission to delete this trip.");

        _context.Trips.Remove(trip);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static TripDetailDto MapTripToDto(Trip t)
    {
        return new TripDetailDto(
            t.Id,
            t.UserId,
            t.Title,
            t.PrimaryCityId,
            t.DurationDays,
            t.BudgetLevel,
            t.Status,
            t.StartDate,
            t.EndDate,
            t.Days.OrderBy(d => d.DayNumber).Select(d => new TripDayDto(
                d.Id,
                d.DayNumber,
                d.TitleAr,
                d.TitleEn,
                d.Items.OrderBy(i => i.Order).Select(i => new TripItemDto(
                    i.Id,
                    i.TimeSlot,
                    i.ItemType,
                    i.ItemId,
                    i.TitleAr,
                    i.TitleEn,
                    i.Notes,
                    i.Order
                )).ToList()
            )).ToList(),
            t.CreatedAt
        );
    }
}
