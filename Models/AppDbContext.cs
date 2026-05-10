using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace starter_code.Models;

// AppDbContext is the class that talks to the SQLite database
// IdentityDbContext gives us all the user/role tables automatically
public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Each DbSet = one table in the database
    public DbSet<Event> Events { get; set; }
    public DbSet<Organizer> Organizers { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Always call this first when using Identity
        base.OnModelCreating(builder);

        // Event belongs to one Organizer. If organizer is deleted, block it (don't cascade)
        builder.Entity<Event>()
            .HasOne(e => e.Organizer)
            .WithMany(o => o.Events)
            .HasForeignKey(e => e.OrganizerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Comment belongs to one Event. If event is deleted, delete its comments too
        builder.Entity<Comment>()
            .HasOne(c => c.Event)
            .WithMany(e => e.Comments)
            .HasForeignKey(c => c.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        // Booking belongs to one Event
        builder.Entity<Booking>()
            .HasOne(b => b.Event)
            .WithMany()
            .HasForeignKey(b => b.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        // Booking belongs to one User
        builder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed the two roles so they exist in the DB from the start
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRole>().HasData(
            new Microsoft.AspNetCore.Identity.IdentityRole 
            { 
                Id = "role-admin", 
                Name = "admin", 
                NormalizedName = "ADMIN" 
            },
            new Microsoft.AspNetCore.Identity.IdentityRole 
            { 
                Id = "role-user", 
                Name = "user", 
                NormalizedName = "USER" 
            }
        );

        // Seed some sample organizers so there's data to test with
        builder.Entity<Organizer>().HasData(
            new Organizer
            {
                Id = 1,
                Fullname = "Ballers Turf Management",
                Email = "events@ballersturf.co.uk",
                Phone = "+44 7512 345678",
                Description = "Our in-house team handles all events, weekly sessions, community programmes, and private pitch bookings."
            },
            new Organizer
            {
                Id = 2,
                Fullname = "Palais FC Coaching Team",
                Email = "coaching@palaisfc.co.uk",
                Phone = "+44 7772 334455",
                Description = "Palais FC is committed to developing local talent and creating opportunities for aspiring footballers."
            }
        );

        // Seed some sample events
        builder.Entity<Event>().HasData(
            new Event
            {
                Id = 1,
                Title = "Grand Opening Event",
                Description = "Celebrate the launch of Ballers Turf with a day filled with football, music and community - everyone is welcome.",
                Location = "Nottingham, UK",
                EventDate = new DateTime(2026, 3, 19, 15, 0, 0),
                Category = "Event",
                Images = "images/event1.png",
                OrganizerId = 1
            },
            new Event
            {
                Id = 2,
                Title = "First Annual Ballers Cup",
                Description = "Be part of the first ever Ballers Cup where you can expect goals, drama and a buzzing atmosphere.",
                Location = "Nottingham, UK",
                EventDate = new DateTime(2026, 4, 10, 12, 0, 0),
                Category = "Tournament",
                Images = "images/event2.jpg",
                OrganizerId = 1
            },
            new Event
            {
                Id = 3,
                Title = "Palais FC Tryouts",
                Description = "Think you have got what it takes to join Palais FC? Showcase your skills and compete for a place in the squad.",
                Location = "Nottingham, UK",
                EventDate = new DateTime(2026, 4, 27, 14, 0, 0),
                Category = "Trials",
                Images = "images/event3.jpg",
                OrganizerId = 2
            }
        );
    }
}
