using System;

namespace Ldf.Core.Entities;

public class Coupon
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public double DiscountPercentage { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;
}
