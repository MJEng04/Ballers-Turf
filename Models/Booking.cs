using System.ComponentModel.DataAnnotations;

namespace starter_code.Models;

public class Booking
{
    public int Id { get; set; }

    public string BookingReference { get; set; } = Guid.NewGuid().ToString("N")[..8].ToUpper();

    public DateTime BookedAt { get; set; } = DateTime.UtcNow;

    public int EventId { get; set; }

    public string UserId { get; set; } = string.Empty;

    public Event? Event { get; set; }
    public AppUser? User { get; set; }
}
