namespace Ldf.Core;

public static class BookingStatuses
{
    public const string Pending = "pending";
    public const string AwaitingPayment = "awaiting_payment";
    public const string Confirmed = "confirmed";
    public const string Cancelled = "cancelled";
    public const string Completed = "completed";
}

public static class PaymentStatuses
{
    public const string Pending = "pending";
    public const string Succeeded = "succeeded";
    public const string Failed = "failed";
    public const string Refunded = "refunded";
}

public static class QuoteRequestStatuses
{
    public const string Open = "open";
    public const string Quoted = "quoted";
    public const string Accepted = "accepted";
    public const string Cancelled = "cancelled";
}

public static class QuoteProposalStatuses
{
    public const string Pending = "pending";
    public const string Accepted = "accepted";
    public const string Rejected = "rejected";
}

public static class DestinationStatuses
{
    public const string Pending = "pending";
    public const string Approved = "approved";
    public const string Rejected = "rejected";
    public const string NeedsChanges = "needs_changes";
    public const string Archived = "archived";
}

public static class ReviewItemTypes
{
    public const string Destination = "destination";
    public const string Package = "package";
    public const string Hotel = "hotel";
    public const string Restaurant = "restaurant";
    public const string Activity = "activity";

    public static readonly string[] AllowedTypes = { Destination, Package, Hotel, Restaurant, Activity };
}

public static class FavoriteItemTypes
{
    public const string Destination = "destination";
    public const string Package = "package";
    public const string Accommodation = "accommodation";
    public const string Guide = "guide";

    public static readonly string[] AllowedTypes = { Destination, Package, Accommodation, Guide };
}

public static class NotificationTypes
{
    public const string Booking = "booking";
    public const string Payment = "payment";
    public const string Quote = "quote";
    public const string Chat = "chat";
    public const string System = "system";
}
