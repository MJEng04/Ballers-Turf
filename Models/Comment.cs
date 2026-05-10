using System.ComponentModel.DataAnnotations;

namespace starter_code.Models;

public class Comment
{
    public int Id { get; set; }

    [Required]
    public string Author { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int EventId { get; set; }

    public Event? Event { get; set; }

    public string? UserId { get; set; }
}
