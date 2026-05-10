using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using starter_code.Models;

namespace starter_code.Controllers;

[Route("api/v2/messages")]
[ApiController]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _db;

    public MessagesController(AppDbContext db)
    {
        _db = db;
    }

    // GET --> Messages
    // Only the admins can view messages
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll()
    {
        var messages = await _db.Messages
            .OrderByDescending(m => m.CreatedAt) // Newest first
            .ToListAsync();

        return Ok(messages);
    }

    // POST --> Messages
    // Anyone (including the guests) can send a contact message
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Message message)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        message.CreatedAt = DateTime.UtcNow;

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Message sent successfully", id = message.Id });
    }

    // DELETE --> Messages
    // Only the admins can delete messages
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var message = await _db.Messages.FindAsync(id);
        if (message == null) return NotFound(new { message = "Message not found" });

        _db.Messages.Remove(message);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Message deleted" });
    }
}
