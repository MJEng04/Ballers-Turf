# Ballers Turf — Sports Event Booking Platform

A RESTful API backend for a sports event booking platform, built with 
ASP.NET Core and C#. Features JWT authentication, role-based authorisation, 
full CRUD operations, and a static HTML/CSS/JS frontend.

## Tech Stack
- **Backend:** ASP.NET Core, C#
- **Database:** SQLite
- **Authentication:** JWT tokens
- **Frontend:** HTML, CSS, JavaScript
- **Architecture:** MVC, RESTful API

## API Endpoints

| Endpoint | Description |
|---|---|
| `/api/v2/events` | Full CRUD for events with search and eager loading |
| `/api/v2/organizers` | Full CRUD for event organisers |
| `/api/v2/comments/{eventId}` | Full CRUD for event comments |
| `/api/v2/messages` | Contact form messages — GET and POST |
| `/api/v2/bookings` | Event booking and ticket generation |

## Features

### Authentication & Authorisation
- JWT token-based authentication
- Three user roles — Guest, User, Admin
- Role-based permission matrix controlling access to all endpoints
- Secure registration and login

### Events
- Create, read, update, delete events
- Search events by multiple attributes
- Eager loading of comments and organiser relationships

### Bookings
- Users can book events and receive booking information
- Ticket generation on successful booking
- View personal bookings and cancel bookings

### Admin
- Full control over events, organisers, comments, and messages
- View all bookings and cancel any booking
- View all contact form messages

## Permission Matrix

| Action | Guest | User | Admin |
|---|---|---|---|
| View Events | ✅ | ✅ | ✅ |
| Create Event | ❌ | ❌ | ✅ |
| Book Event | ❌ | ✅ | ✅ |
| Create Comment | ❌ | ✅ | ✅ |
| Delete Own Comment | ❌ | ✅ | ✅ |
| View Messages | ❌ | ❌ | ✅ |

## Architecture
The system is built around a clear class structure separating concerns:

| Class | Responsibility |
|---|---|
| `AuthController` | User registration, login, JWT token generation |
| `EventsController` | CRUD operations for events, search, eager loading |
| `OrganizersController` | CRUD operations for event organisers |
| `CommentsController` | CRUD operations for comments on events |
| `MessagesController` | Contact form message creation and retrieval |
| `BookingsController` | Event booking, ticket generation, cancellation |
| `AppDbContext` | Entity Framework database context and relationships |
| `AppUser` | User entity with role assignments |
| `RedirectRootMiddleware` | Handles root URL redirection to frontend |

## How to Run

**Prerequisites:**
- .NET 9 SDK
- SQLite

**Setup:**
```bash
# Clone the repo
git clone https://github.com/MJEng04/Ballers-Turf.git
cd Ballers-Turf

# Copy the example config and add your JWT secret
cp appsettings.example.json appsettings.json

# Run the application
dotnet run
```

**The API will be available at:** `http://localhost:5000`

## Project Structure
```
ballers-turf/
├── Controllers/
│   ├── AuthController.cs
│   ├── EventsController.cs
│   ├── OrganizersController.cs
│   ├── CommentsController.cs
│   ├── MessagesController.cs
│   └── BookingsController.cs
├── DTOs/
│   └── AuthDtos.cs
├── Middleware/
│   └── RedirectRootMiddleware.cs
├── Models/
│   ├── AppDbContext.cs
│   ├── AppUser.cs
│   ├── Event.cs
│   ├── Booking.cs
│   ├── Comment.cs
│   ├── Message.cs
│   └── Organizer.cs
├── wwwroot/
│   ├── index.html
│   ├── events.html
│   ├── bookings.html
│   ├── admin.html
│   ├── login.html
│   ├── css/
│   ├── js/
│   └── images/
├── Pages/
├── Properties/
├── Program.cs
├── Initialiser.cs
└── appsettings.example.json
```

## Frontend
The static frontend is served from `wwwroot/` and integrates directly 
with the API endpoints. Pages include a homepage, events listing, 
event detail, bookings management, contact form, and admin dashboard.
