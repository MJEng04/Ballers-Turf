using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using starter_code.Models;

namespace starter_code.Controllers;

[Route("api/v2/organizers")]
[ApiController]
public class OrganizersController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrganizersController(AppDbContext db)
    {
        _db = db;
    }

    // GET --> Organizers
    // Anyone can view organizers
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var organizers = await _db.Organizers.ToListAsync();
        return Ok(organizers);
    }

    // GET --> Organizers
    // Anyone can view a single organizer
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOne(int id)
    {
        var organizer = await _db.Organizers
            .Include(o => o.Events) // Also load their events
            .FirstOrDefaultAsync(o => o.Id == id);

        if (organizer == null) return NotFound(new { message = "Organizer not found" });

        return Ok(organizer);
    }

    // POST --> Organizers
    // Only the admins can create organizers
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] Organizer organizer)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        _db.Organizers.Add(organizer);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = organizer.Id }, organizer);
    }

    // PUT --> Organizers
    // Only the admins can update organizers
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Organizer updated)
    {
        var organizer = await _db.Organizers.FindAsync(id);
        if (organizer == null) return NotFound(new { message = "Organizer not found" });

        organizer.Fullname = updated.Fullname;
        organizer.Email = updated.Email;
        organizer.Phone = updated.Phone;
        organizer.Description = updated.Description;

        await _db.SaveChangesAsync();
        return Ok(organizer);
    }

    // DELETE --> Organizers
    // Only the admins can delete organizers
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var organizer = await _db.Organizers.FindAsync(id);
        if (organizer == null) return NotFound(new { message = "Organizer not found" });

        _db.Organizers.Remove(organizer);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Organizer deleted" });
    }
}
