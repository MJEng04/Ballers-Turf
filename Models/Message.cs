using System.ComponentModel.DataAnnotations;

namespace starter_code.Models;

public class Message
{
    public int Id { get; set; }

    [Required]
    public string Fullname { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
