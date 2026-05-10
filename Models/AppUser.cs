using Microsoft.AspNetCore.Identity;

namespace starter_code.Models;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber2 { get; set; }
    public DateTime? DateOfBirth { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
