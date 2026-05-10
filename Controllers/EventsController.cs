using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using starter_code.Models;

namespace starter_code.Controllers;

[Route("api/v2/events")]
[ApiController]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _db;

    public EventsController(AppDbContext db)
    {
        _db = db;
    }

    // GET --> Events
    // Anyone can view events
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? location)
    {
        // Starts with all events --> include() does eager loading (for organizer + comments)
        var query = _db.Events
            .Include(e => e.Organizer)
            .Include(e => e.Comments)
            .AsQueryable();

        // Filters by search term (e.g. checks title, description, location)
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(e =>
                e.Title.Contains(search) ||
                e.Description.Contains(search) ||
                e.Location.Contains(search));
        }

        // Filters by category
        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(e => e.Category == category);
        }

        // Filters by location
        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(e => e.Location.Contains(location));
        }

        var events = await query.ToListAsync();
        return Ok(events);
    }

    // GET --> Events
    // Anyone can view a single event
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOne(int id)
    {
        // Loads organizer and comments
        var ev = await _db.Events
            .Include(e => e.Organizer)
            .Include(e => e.Comments)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (ev == null) return NotFound(new { message = "Event not found" });

        return Ok(ev);
    }

    // POST --> Events
    // Only the admins can create events
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] Event ev)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        _db.Events.Add(ev);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = ev.Id }, ev);
    }

    // PUT --> Events
    // Only the admins can update events
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Event updated)
    {
        var ev = await _db.Events.FindAsync(id);
        if (ev == null) return NotFound(new { message = "Event not found" });

        // Updates each field
        ev.Title = updated.Title;
        ev.Description = updated.Description;
        ev.Location = updated.Location;
        ev.EventDate = updated.EventDate;
        ev.Category = updated.Category;
        ev.Images = updated.Images;
        ev.OrganizerId = updated.OrganizerId;

        await _db.SaveChangesAsync();
        return Ok(ev);
    }

    // DELETE --> Events
    // Only the admins can delete events
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var ev = await _db.Events.FindAsync(id);
        if (ev == null) return NotFound(new { message = "Event not found" });

        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Event deleted" });
    }
}
