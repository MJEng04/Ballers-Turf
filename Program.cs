using api;
using starter_code;
using starter_code.Middleware;
using starter_code.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// RAZOR PAGES --> from starter code
builder.Services.AddRazorPages();

// DATABASE --> SQLite via Entity Framework
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={Initialiser.GetDir("AyventDb.db")}"));

// IDENTITY --> handles users, passwords, roles
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// JWT AUTHENTICATION
var jwtKey = builder.Configuration["Jwt:Key"] ?? "BallersTurfSecretKey2026SuperSecret";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// CONTROLLERS --> for /api/v2/ route
builder.Services.AddControllers()
    .AddJsonOptions(x =>
        x.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

// CORS --> allows HTML pages to call API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// STARTER CODE SERVICES
builder.RegisterApi(Initialiser.GetDir(builder.Configuration.GetValue<string>("DbFile") ?? ""));

var app = builder.Build();

// AUTO RUNS DATABASE MIGRATIONS ON STARTUP
Initialiser.Start();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Starter code initialiser
Initialiser.Start();

// MIDDLEWARE
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseApi();           // Starter code API (/api/)
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseRedirectRoot();
app.MapRazorPages();
app.MapControllers();

app.Run();
