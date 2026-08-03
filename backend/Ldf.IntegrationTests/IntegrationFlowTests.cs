using System;
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

namespace Ldf.IntegrationTests;

public class IntegrationFlowTests
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
    public async Task PaymentConfirmation_DoubleConfirmationFailsGracefully()
    {
        // Arrange
        using var context = GetInMemoryDbContext(Guid.NewGuid().ToString());
        var notifService = new NotificationService(context);
        var paymentService = new PaymentService(context, notifService);

        var booking = new Booking
        {
            Id = "book_test",
            UserId = "user_1",
            TotalPrice = 500.0,
            Status = BookingStatuses.Pending,
            PaymentStatus = PaymentStatuses.Pending
        };
        var payment = new Payment
        {
            Id = "pay_test",
            BookingId = "book_test",
            UserId = "user_1",
            Amount = 500.0,
            Status = PaymentStatuses.Pending
        };
        await context.Bookings.AddAsync(booking);
        await context.Payments.AddAsync(payment);
        await context.SaveChangesAsync();

        // Act 1 - First confirmation succeeds
        var confirmResult = await paymentService.ConfirmPaymentAsync("pay_test", "user_1");
        Assert.True(confirmResult.Success);
        Assert.Equal(PaymentStatuses.Succeeded, confirmResult.Status);

        // Act 2 & Assert - Second confirmation fails with ConflictException 409
        await Assert.ThrowsAsync<ConflictException>(() => paymentService.ConfirmPaymentAsync("pay_test", "user_1"));
    }

    [Fact]
    public async Task QuoteAcceptance_DoubleAcceptanceIsProtected()
    {
        // Arrange
        using var context = GetInMemoryDbContext(Guid.NewGuid().ToString());
        var notifService = new NotificationService(context);
        var quoteService = new QuoteService(context, notifService);

        var request = new QuoteRequest
        {
            Id = "qr_test",
            UserId = "user_1",
            UserName = "Traveler",
            Status = QuoteRequestStatuses.Quoted
        };
        var prop1 = new QuoteProposal { Id = "qp_1", RequestId = "qr_test", OfficeId = "office_1", Price = 1000, Status = QuoteProposalStatuses.Pending };
        var prop2 = new QuoteProposal { Id = "qp_2", RequestId = "qr_test", OfficeId = "office_2", Price = 1200, Status = QuoteProposalStatuses.Pending };

        await context.QuoteRequests.AddAsync(request);
        await context.QuoteProposals.AddRangeAsync(new[] { prop1, prop2 });
        await context.SaveChangesAsync();

        // Act 1 - Accept prop1
        var acceptResult = await quoteService.AcceptProposalAsync("qr_test", "user_1", "qp_1");
        Assert.Equal("qp_1", acceptResult.AcceptedQuoteId);

        // Act 2 & Assert - Attempting to accept prop2 after request is accepted should fail with ConflictException
        await Assert.ThrowsAsync<ConflictException>(() => quoteService.AcceptProposalAsync("qr_test", "user_1", "qp_2"));
    }

    [Fact]
    public async Task ChatMessage_ClientMessageIdDeduplicatesReplayedMessages()
    {
        // Arrange
        using var context = GetInMemoryDbContext(Guid.NewGuid().ToString());
        var conversationService = new ConversationService(context);

        var session = new ChatSession
        {
            Id = "chat_test",
            ParticipantAId = "user_1",
            ParticipantBId = "user_2"
        };
        await context.ChatSessions.AddAsync(session);
        await context.SaveChangesAsync();

        var msgDto = new SendMessageRequestDto("Hello from client!", null, null, null, "client_msg_uuid_999");

        // Act - Send message first time
        var msg1 = await conversationService.SendMessageAsync("chat_test", "user_1", msgDto);

        // Act - Send same message with identical ClientMessageId second time (reconnect retry)
        var msg2 = await conversationService.SendMessageAsync("chat_test", "user_1", msgDto);

        // Assert - Both calls return the identical message ID and no duplicate rows are created
        Assert.Equal(msg1.Id, msg2.Id);
        var totalMessages = await context.ChatMessages.CountAsync();
        Assert.Equal(1, totalMessages);
    }
}
