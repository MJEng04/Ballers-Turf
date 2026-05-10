using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using starter_code.Models;
using System.Security.Claims;

namespace starter_code.Controllers;

[Route("api/v2/bookings")]
[ApiController]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BookingsController(AppDbContext db)
    {
        _db = db;
    }

    // GET --> Bookings
    // Admins get to see all bookings but regular users see only their own.
    [HttpGet]
    [Authorize(Roles = "user,admin")]
    public async Task<IActionResult> GetAll()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("admin");

        IQueryable<Booking> query = _db.Bookings
            .Include(b => b.Event) // Loads event details with each booking
            .Include(b => b.User);

        // If not admin --> only show user's bookings
        if (!isAdmin)
        {
            query = query.Where(b => b.UserId == currentUserId);
        }

        var bookings = await query.ToListAsync();
        return Ok(bookings);
    }

    // POST --> Bookings
    // All logged-in users can book an event
    [HttpPost]
    [Authorize(Roles = "user,admin")]
    public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Check event exists
        var ev = await _db.Events.FindAsync(dto.EventId);
        if (ev == null) return NotFound(new { message = "Event not found" });

        // Check user hasn't already booked this event
        var alreadyBooked = await _db.Bookings
            .AnyAsync(b => b.EventId == dto.EventId && b.UserId == currentUserId);

        if (alreadyBooked) return BadRequest(new { message = "You have already booked this event" });

        var booking = new Booking
        {
            EventId = dto.EventId,
            UserId = currentUserId!,
            BookedAt = DateTime.UtcNow,
            // Auto-generates reference --> e.g. A3F9BC67
            BookingReference = Guid.NewGuid().ToString("N")[..8].ToUpper()
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        // Loads event details to return with booking
        await _db.Entry(booking).Reference(b => b.Event).LoadAsync();

        return Ok(new
        {
            message = "Booking confirmed!",
            bookingReference = booking.BookingReference,
            eventTitle = ev.Title,
            eventDate = ev.EventDate,
            bookedAt = booking.BookedAt
        });
    }

    // DELETE --> Bookings
    // Users can cancel their own bookings and admins can cancel any booking.
    [HttpDelete("{id}")]
    [Authorize(Roles = "user,admin")]
    public async Task<IActionResult> Cancel(int id)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return NotFound(new { message = "Booking not found" });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("admin");

        // Only allows cancel if user booked it or is an admin
        if (booking.UserId != currentUserId && !isAdmin)
        {
            return Forbid();
        }

        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Booking cancelled" });
    }
}

// DTO for creating a booking --> only needs event ID
// User ID comes from the JWT token automatically
public class CreateBookingDto
{
    public int EventId { get; set; }
}
