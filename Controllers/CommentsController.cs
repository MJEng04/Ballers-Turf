using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using starter_code.Models;
using System.Security.Claims;

namespace starter_code.Controllers;

// All comment routes include event they belong to
[Route("api/v2/comments/{eventId}")]
[ApiController]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CommentsController(AppDbContext db)
    {
        _db = db;
    }

    // GET --> Comments
    // Anyone can view comments for an event
    [HttpGet]
    public async Task<IActionResult> GetAll(int eventId)
    {
        var comments = await _db.Comments
            .Where(c => c.EventId == eventId)
            .ToListAsync();

        return Ok(comments);
    }

    // GET --> Comments
    // Anyone can view a single comment
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOne(int eventId, int id)
    {
        var comment = await _db.Comments
            .FirstOrDefaultAsync(c => c.Id == id && c.EventId == eventId);

        if (comment == null) return NotFound(new { message = "Comment not found" });

        return Ok(comment);
    }

    // POST --> Comments
    // Only logged in users (e.g. user or admin) can post comments
    [HttpPost]
    [Authorize(Roles = "user,admin")]
    public async Task<IActionResult> Create(int eventId, [FromBody] Comment comment)
    {
        // Checks if the event exists first
        var eventExists = await _db.Events.AnyAsync(e => e.Id == eventId);
        if (!eventExists) return NotFound(new { message = "Event not found" });

        comment.EventId = eventId;
        comment.CreatedAt = DateTime.UtcNow;

        // Stores who posted this comment (needed for deleting comment)
        comment.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { eventId, id = comment.Id }, comment);
    }

    // PUT --> Comments
    // Users can update their own comments --> admins can update any comment
    [HttpPut("{id}")]
    [Authorize(Roles = "user,admin")]
    public async Task<IActionResult> Update(int eventId, int id, [FromBody] Comment updated)
    {
        var comment = await _db.Comments
            .FirstOrDefaultAsync(c => c.Id == id && c.EventId == eventId);

        if (comment == null) return NotFound(new { message = "Comment not found" });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("admin");

        // Only allow update if user owns the comment OR is admin
        if (comment.UserId != currentUserId && !isAdmin)
            return Forbid();

        comment.Content = updated.Content;
        await _db.SaveChangesAsync();

        return Ok(comment);
    }

    // DELETE --> Comments
    // Users can delete their own comments --> admins can delete any comment
    [HttpDelete("{id}")]
    [Authorize(Roles = "user,admin")]
    public async Task<IActionResult> Delete(int eventId, int id)
    {
        var comment = await _db.Comments
            .FirstOrDefaultAsync(c => c.Id == id && c.EventId == eventId);

        if (comment == null) return NotFound(new { message = "Comment not found" });

        // Retrieves current user's ID and role from JWT token
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("admin");

        // Allows delete if --> user owns the comment or user is admin
        if (comment.UserId != currentUserId && !isAdmin)
        {
            return Forbid();
        }

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Comment deleted" });
    }
}
