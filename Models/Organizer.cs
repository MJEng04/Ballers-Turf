using System.ComponentModel.DataAnnotations;

namespace starter_code.Models;

public class Organizer
{
    public int Id { get; set; }

    [Required]
    public string Fullname { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Description { get; set; }

    public ICollection<Event> Events { get; set; } = new List<Event>();
}
