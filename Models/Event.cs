using System.ComponentModel.DataAnnotations;

namespace starter_code.Models;

public class Event
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Location { get; set; } = string.Empty;

    public DateTime EventDate { get; set; }

    [Required]
    public string Category { get; set; } = string.Empty;

    public string? Images { get; set; }

    public int OrganizerId { get; set; }

    public Organizer? Organizer { get; set; }
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
