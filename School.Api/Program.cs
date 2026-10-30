
using School.Api.Authorization;
using School.Api.Data;
using School.Api.Models;
using School.Api.Services;
using School.Core.Interfaces;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

using Resend;

using System.Security.Claims;
using System.Text;

// ============================================================
// BUILDER
// ============================================================

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;


// ============================================================
// CONFIGURATION
// ============================================================
//
// Prevent JSON configuration files from automatically
// reloading while the application is running.
//

foreach (var source in builder.Configuration.Sources
    .OfType<Microsoft.Extensions.Configuration.Json.JsonConfigurationSource>())
{
    source.ReloadOnChange = false;
}


// ============================================================
// SERVICES
// ============================================================

ConfigureResend(
    builder,
    configuration);

ConfigureApplicationServices(
    builder);

ConfigureDatabase(
    builder.Services,
    configuration);

ConfigureCors(
    builder.Services);

ConfigureJwtAuthentication(
    builder.Services,
    configuration);

ConfigureSwagger(
    builder.Services);


// ============================================================
// CONTROLLERS
// ============================================================

builder.Services.AddControllers();
builder.Services.AddMemoryCache();

// ============================================================
// AUTHORIZATION
// ============================================================

builder.Services.AddAuthorization();


// ============================================================
// BUILD
// ============================================================

var app = builder.Build();


// ============================================================
// DATABASE SEEDING
// ============================================================

await SeedDatabaseAsync(app);


// ============================================================
// MEMBER PHOTO STORAGE
// ============================================================

var memberPhotoFolder =
    Path.Combine(
        app.Environment.ContentRootPath,
        "root-uploads-members");

Directory.CreateDirectory(
    memberPhotoFolder);

var galleryPhotoFolder =
    Path.Combine(
        app.Environment.ContentRootPath,
        "root-uploads-gallery");

Directory.CreateDirectory(
    galleryPhotoFolder);

var facultyPhotoFolder =
    Path.Combine(
        app.Environment.ContentRootPath,
        "root-uploads-faculty");

Directory.CreateDirectory(
    facultyPhotoFolder);

var historyPhotoFolder =
    Path.Combine(
        app.Environment.ContentRootPath,
        "root-uploads-history");

Directory.CreateDirectory(
    historyPhotoFolder);


// ============================================================
// SWAGGER
// ============================================================

app.UseSwagger();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint(
        "/swagger/v1/swagger.json",
        "EPIC Church Management API v1");

    options.DocumentTitle =
        "EPIC Church Management API";
});


// ============================================================
// CORS
// ============================================================

app.UseCors(
    "EPICWebPolicy");


// ============================================================
// STATIC MEMBER PHOTOS
// ============================================================

app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider =
            new PhysicalFileProvider(
                memberPhotoFolder),

        RequestPath =
            "/member-photos"
    });

app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider =
            new PhysicalFileProvider(
                galleryPhotoFolder),

        RequestPath =
            "/gallery-photos"
    });

app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider =
            new PhysicalFileProvider(
                facultyPhotoFolder),

        RequestPath =
            "/faculty-photos"
    });

app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider =
            new PhysicalFileProvider(
                historyPhotoFolder),

        RequestPath =
            "/history-photos"
    });


// ============================================================
// HTTPS REDIRECTION
// ============================================================
//
// Disabled for current LAN development.
//
// Local:
// http://localhost:5109
//
// LAN:
// http://192.168.1.10:5109
//
// Enable when HTTPS is configured for production.
//

// app.UseHttpsRedirection();


// ============================================================
// AUTHENTICATION
// ============================================================
//
// IMPORTANT:
// Authentication MUST run before Authorization.
//

app.UseAuthentication();


// ============================================================
// AUTHORIZATION
// ============================================================

app.UseAuthorization();


// ============================================================
// CONTROLLERS
// ============================================================

app.MapControllers();


// ============================================================
// RUN
// ============================================================

app.Run();


// ============================================================
// APPLICATION SERVICES
// ============================================================

static void ConfigureApplicationServices(
    WebApplicationBuilder builder)
{
    // --------------------------------------------------------
    // HTTP CONTEXT
    // --------------------------------------------------------

    builder.Services.AddHttpContextAccessor();


    // --------------------------------------------------------
    // CURRENT USER
    // --------------------------------------------------------

    builder.Services.AddScoped<
        ICurrentUserService,
        CurrentUserService>();


    // --------------------------------------------------------
    // MEMBER ACCOUNT PROVISIONING
    // --------------------------------------------------------

    builder.Services.AddScoped<
        MemberAccountProvisioningService>();


    // --------------------------------------------------------
    // CLIENT PERMISSIONS
    // --------------------------------------------------------

    builder.Services.AddScoped<
        IClientPermissionService,
        ClientPermissionService>();

    builder.Services.AddScoped<
        ClientPermissionAuthorization>();


    // --------------------------------------------------------
    // PAYMONGO PAYMENT GATEWAY (GCash, Maya, Cards, QR Ph)
    // --------------------------------------------------------

    builder.Services.AddHttpClient<IPayMongoService, PayMongoService>();


    // --------------------------------------------------------
    // GENERAL PERMISSIONS
    // --------------------------------------------------------

    builder.Services.AddScoped<
        IPermissionService,
        PermissionService>();


    // --------------------------------------------------------
    // SUBSCRIPTIONS
    // --------------------------------------------------------

    builder.Services.AddScoped<
        SubscriptionLifecycleService>();

    builder.Services.AddHostedService<
        SubscriptionLifecycleWorker>();
}


// ============================================================
// RESEND EMAIL CONFIGURATION
// ============================================================

static void ConfigureResend(
    WebApplicationBuilder builder,
    IConfiguration configuration)
{
    var resendApiKey =
        configuration["Resend:ApiKey"];

    if (string.IsNullOrWhiteSpace(resendApiKey))
    {
        resendApiKey = "re_placeholder_optional_email_key";
    }


    builder.Services.AddHttpClient();


    builder.Services.Configure<ResendClientOptions>(
        options =>
        {
            options.ApiToken =
                resendApiKey;
        });


    builder.Services.AddScoped<
        IResend,
        ResendClient>();


    builder.Services.AddScoped<
        ResendEmailService>();
}


// ============================================================
// DATABASE CONFIGURATION
// ============================================================

static void ConfigureDatabase(
    IServiceCollection services,
    IConfiguration configuration)
{
    var connectionString =
        configuration.GetConnectionString(
            "EPICChurchDB");

    if (string.IsNullOrWhiteSpace(
        connectionString))
    {
        throw new InvalidOperationException(
            "Database connection string " +
            "'EPICChurchDB' is missing.");
    }


    services.AddDbContext<ApplicationDbContext>(
        options =>
        {
            options.UseSqlServer(
                connectionString);
        });
}


// ============================================================
// CORS CONFIGURATION
// ============================================================

static void ConfigureCors(
    IServiceCollection services)
{
    services.AddCors(
        options =>
        {
            options.AddPolicy(
                "EPICWebPolicy",
                policy =>
                {
                    policy
                        .SetIsOriginAllowed(
                            IsAllowedOrigin)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });
}


// ============================================================
// JWT CONFIGURATION
// ============================================================

static void ConfigureJwtAuthentication(
    IServiceCollection services,
    IConfiguration configuration)
{
    // --------------------------------------------------------
    // READ SETTINGS
    // --------------------------------------------------------

    var jwtKey =
        configuration["Jwt:Key"];

    var jwtIssuer =
        configuration["Jwt:Issuer"];

    var jwtAudience =
        configuration["Jwt:Audience"];


    // --------------------------------------------------------
    // VALIDATE SETTINGS
    // --------------------------------------------------------

    if (string.IsNullOrWhiteSpace(jwtKey))
    {
        throw new InvalidOperationException(
            "JWT Key is missing. " +
            "Check appsettings.json.");
    }


    if (string.IsNullOrWhiteSpace(jwtIssuer))
    {
        throw new InvalidOperationException(
            "JWT Issuer is missing. " +
            "Check appsettings.json.");
    }


    if (string.IsNullOrWhiteSpace(jwtAudience))
    {
        throw new InvalidOperationException(
            "JWT Audience is missing. " +
            "Check appsettings.json.");
    }


    // --------------------------------------------------------
    // SECURITY KEY
    // --------------------------------------------------------

    var securityKey =
        new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                jwtKey));


    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    services
        .AddAuthentication(
            JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(
            options =>
            {
                // ------------------------------------------------
                // IMPORTANT
                // ------------------------------------------------
                //
                // Keep custom JWT claims exactly as generated
                // by ClientAuthController.
                //
                // Examples:
                //
                // clientMemberId
                // customerId
                // CustomerId
                // memberId
                // MemberId
                // clientRoleId
                // clientRoleName
                //
                // ------------------------------------------------

                options.MapInboundClaims =
                    false;


                // ------------------------------------------------
                // TOKEN VALIDATION
                // ------------------------------------------------

                options.TokenValidationParameters =
                    new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey =
                            true,

                        IssuerSigningKey =
                            securityKey,

                        ValidateIssuer =
                            true,

                        ValidIssuer =
                            jwtIssuer,

                        ValidateAudience =
                            true,

                        ValidAudience =
                            jwtAudience,

                        ValidateLifetime =
                            true,

                        ClockSkew =
                            TimeSpan.Zero,

                        // ------------------------------------------------
                        // ROLE CLAIM
                        // ------------------------------------------------
                        //
                        // ClientAuthController creates:
                        //
                        // ClaimTypes.Role = "CLIENT"
                        //
                        // Explicitly tell JWT authentication to use
                        // ClaimTypes.Role for [Authorize(Roles = "...")].
                        //

                        RoleClaimType =
                            ClaimTypes.Role,

                        // ------------------------------------------------
                        // NAME CLAIM
                        // ------------------------------------------------

                        NameClaimType =
                            ClaimTypes.Name
                    };


                // ------------------------------------------------
                // JWT EVENTS
                // ------------------------------------------------

                options.Events =
                    new JwtBearerEvents
                    {
                        // ============================================
                        // AUTHENTICATION FAILED
                        // ============================================

                        OnAuthenticationFailed =
                            context =>
                            {
                                Console.WriteLine();
                                Console.WriteLine(
                                    "================================================");
                                Console.WriteLine(
                                    "JWT AUTHENTICATION FAILED");
                                Console.WriteLine(
                                    "================================================");

                                Console.WriteLine(
                                    $"Exception Type: " +
                                    $"{context.Exception.GetType().FullName}");

                                Console.WriteLine(
                                    $"Message: " +
                                    $"{context.Exception.Message}");

                                if (context.Exception.InnerException != null)
                                {
                                    Console.WriteLine();
                                    Console.WriteLine(
                                        "Inner Exception:");

                                    Console.WriteLine(
                                        context.Exception.InnerException);
                                }

                                Console.WriteLine(
                                    "================================================");
                                Console.WriteLine();

                                return Task.CompletedTask;
                            },


                        // ============================================
                        // TOKEN VALIDATED
                        // ============================================

                        OnTokenValidated =
                            context =>
                            {
                                Console.WriteLine();
                                Console.WriteLine(
                                    "================================================");
                                Console.WriteLine(
                                    "JWT TOKEN VALIDATED");
                                Console.WriteLine(
                                    "================================================");

                                Console.WriteLine(
                                    $"User: " +
                                    $"{context.Principal?.Identity?.Name}");

                                Console.WriteLine(
                                    $"Authenticated: " +
                                    $"{context.Principal?.Identity?.IsAuthenticated}");

                                Console.WriteLine(
                                    $"Authentication Type: " +
                                    $"{context.Principal?.Identity?.AuthenticationType}");

                                Console.WriteLine();

                                foreach (
                                    var claim
                                    in context.Principal?.Claims
                                    ?? Enumerable.Empty<Claim>())
                                {
                                    Console.WriteLine(
                                        $"CLAIM: {claim.Type} = {claim.Value}");
                                }

                                Console.WriteLine(
                                    "================================================");
                                Console.WriteLine();

                                return Task.CompletedTask;
                            },


                        // ============================================
                        // AUTHORIZATION CHALLENGE
                        // ============================================

                        OnChallenge =
                            context =>
                            {
                                Console.WriteLine();
                                Console.WriteLine(
                                    "================================================");
                                Console.WriteLine(
                                    "JWT AUTHORIZATION CHALLENGE");
                                Console.WriteLine(
                                    "================================================");

                                Console.WriteLine(
                                    $"Error: " +
                                    $"{context.Error ?? "(none)"}");

                                Console.WriteLine(
                                    $"Description: " +
                                    $"{context.ErrorDescription ?? "(none)"}");

                                var failureType =
                                    context.AuthenticateFailure
                                        ?.GetType()
                                        .FullName
                                    ?? "(none)";

                                Console.WriteLine(
                                    $"Authenticate Failure: " +
                                    $"{failureType}");

                                if (context.AuthenticateFailure != null)
                                {
                                    Console.WriteLine();
                                    Console.WriteLine(
                                        "Authentication Failure:");

                                    Console.WriteLine(
                                        context.AuthenticateFailure);
                                }

                                Console.WriteLine(
                                    "================================================");
                                Console.WriteLine();

                                return Task.CompletedTask;
                            }
                    };
            });
}


// ============================================================
// SWAGGER CONFIGURATION
// ============================================================

static void ConfigureSwagger(
    IServiceCollection services)
{
    services.AddEndpointsApiExplorer();


    services.AddSwaggerGen(
        options =>
        {
            // ----------------------------------------------------
            // DOCUMENT
            // ----------------------------------------------------

            options.SwaggerDoc(
                "v1",
                new Microsoft.OpenApi.OpenApiInfo
                {
                    Title =
                        "EPIC Church Management API",

                    Version =
                        "v1",

                    Description =
                        "EPIC Church Management System API"
                });


            // ----------------------------------------------------
            // BEARER SECURITY DEFINITION
            // ----------------------------------------------------

            options.AddSecurityDefinition(
                "Bearer",
                new Microsoft.OpenApi.OpenApiSecurityScheme
                {
                    Name =
                        "Authorization",

                    Type =
                        Microsoft.OpenApi.SecuritySchemeType.Http,

                    Scheme =
                        "bearer",

                    BearerFormat =
                        "JWT",

                    In =
                        Microsoft.OpenApi.ParameterLocation.Header,

                    Description =
                        "Enter your JWT token."
                });


            // ----------------------------------------------------
            // SECURITY REQUIREMENT
            // ----------------------------------------------------

            options.AddSecurityRequirement(
                document =>
                    new Microsoft.OpenApi.OpenApiSecurityRequirement
                    {
                        {
                            new Microsoft.OpenApi
                                .OpenApiSecuritySchemeReference(
                                    "Bearer",
                                    document),

                            new List<string>()
                        }
                    });
        });
}


// ============================================================
// DATABASE SEEDING
// ============================================================

static async Task SeedDatabaseAsync(
    WebApplication app)
{
    using var scope =
        app.Services.CreateScope();

    var services =
        scope.ServiceProvider;


    try
    {
        var context =
            services.GetRequiredService<
                ApplicationDbContext>();

        // --------------------------------------------------------
        // INSTITUTION / CUSTOMER SEEDING & USER SYNC
        // --------------------------------------------------------

        if (!await context.Customers.AnyAsync())
        {
            var defaultCustomer = new Customer
            {
                ChurchName = "Mindanao Bible Seminary",
                ContactPerson = "System Administrator",
                Email = "admin@mbs.edu.ph",
                Status = "Active",
                CreatedDate = DateTime.UtcNow
            };
            context.Customers.Add(defaultCustomer);
            await context.SaveChangesAsync();
        }

        var defaultCustId = await context.Customers
            .OrderBy(c => c.CustomerId)
            .Select(c => c.CustomerId)
            .FirstOrDefaultAsync();

        if (defaultCustId > 0)
        {
            var unassignedUsers = await context.Users
                .Where(u => !u.CustomerId.HasValue || u.CustomerId.Value <= 0)
                .ToListAsync();

            if (unassignedUsers.Any())
            {
                foreach (var u in unassignedUsers)
                {
                    u.CustomerId = defaultCustId;
                }
                await context.SaveChangesAsync();
            }
        }

        // --------------------------------------------------------
        // CLIENT ROLES
        // --------------------------------------------------------

        await ClientRoleSeeder.SeedAsync(
            context);


        // --------------------------------------------------------
        // CLIENT PERMISSIONS
        // --------------------------------------------------------

        await ClientPermissionSeeder.SeedAsync(
            context);

        // --------------------------------------------------------
        // SUBSCRIPTION PLANS
        // --------------------------------------------------------

        await DatabaseSeeder.SeedSubscriptionPlansAsync(
            context);

        // --------------------------------------------------------
        // SEED STUDENT / CLIENT MEMBER ACCOUNTS (student demo)
        // --------------------------------------------------------
        if (defaultCustId > 0)
        {
            var studentRole = await context.ClientRoles
                .FirstOrDefaultAsync(cr => cr.RoleName == "CLIENT_MEMBER" || cr.RoleName == "STUDENT")
                ?? await context.ClientRoles.OrderByDescending(cr => cr.ClientRoleId).FirstOrDefaultAsync();

            if (studentRole != null)
            {
                // Ensure Member for student demo
                var demoMember = await context.Members
                    .FirstOrDefaultAsync(m => m.MemberCode == "STD-2026-0001");
                if (demoMember == null)
                {
                    demoMember = new Member
                    {
                        CustomerId = defaultCustId,
                        MemberCode = "STD-2026-0001",
                        FirstName = "Enrolled",
                        LastName = "Student",
                        Status = "ACTIVE",
                        ContactNumber = "+63 917 123 4567",
                        CreatedDate = DateTime.UtcNow
                    };
                    context.Members.Add(demoMember);
                    await context.SaveChangesAsync();
                }

                // Ensure ClientMember for student demo
                var demoClient = await context.ClientMembers
                    .FirstOrDefaultAsync(cm => cm.Username.ToLower() == "student");
                if (demoClient == null)
                {
                    demoClient = new ClientMember
                    {
                        CustomerId = defaultCustId,
                        MemberId = demoMember.MemberId,
                        ClientRoleId = studentRole.ClientRoleId,
                        Username = "student",
                        Email = "student@mbs.edu.ph",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                        Status = "ACTIVE",
                        IsActive = true,
                        CreatedDate = DateTime.UtcNow
                    };
                    context.ClientMembers.Add(demoClient);
                    await context.SaveChangesAsync();
                }
                else
                {
                    demoClient.IsActive = true;
                    demoClient.Status = "ACTIVE";
                    demoClient.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");
                    await context.SaveChangesAsync();
                }
            }
        }

        // --------------------------------------------------------
        // EVENTS SEEDING (MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY)
        // --------------------------------------------------------
        if (!await context.Events.AnyAsync() && defaultCustId > 0)
        {
            var seedEvents = new List<Event>
            {
                new Event
                {
                    CustomerId = defaultCustId,
                    Title = "Modular Pastoral Intensive: Expository Preaching & Hermeneutics",
                    EventType = "Pastoral Intensive",
                    EventDate = new DateTime(2026, 11, 14),
                    StartTime = new TimeSpan(9, 0, 0),
                    EndTime = new TimeSpan(17, 0, 0),
                    Venue = "Main Seminary Campus (Hall A) & Zoom",
                    Speaker = "Dr. Jonathan M. Cruz, M.Th.",
                    Ministry = "Biblical Studies & Homiletics",
                    Status = "SCHEDULED",
                    Description = "In-depth exegetical study of original biblical manuscripts, homiletical structural design, and verse-by-verse expository pulpit delivery for pastors and church leaders.",
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    CustomerId = defaultCustId,
                    Title = "Seminary Admissions Open House & Campus Tour",
                    EventType = "Admissions Open House",
                    EventDate = new DateTime(2026, 12, 5),
                    StartTime = new TimeSpan(10, 0, 0),
                    EndTime = new TimeSpan(14, 0, 0),
                    Venue = "Metro Manila Seminary Headquarters",
                    Speaker = "Admissions Directorate & Faculty Deans",
                    Ministry = "Academic Admissions Desk",
                    Status = "SCHEDULED",
                    Description = "Tour our theological library, meet distinguished pastoral faculty, evaluate degree credits, and receive on-the-spot modular enrollment assistance.",
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    CustomerId = defaultCustId,
                    Title = "National Church Planting & Leadership Colloquium",
                    EventType = "Leadership Summit",
                    EventDate = new DateTime(2027, 1, 22),
                    StartTime = new TimeSpan(8, 30, 0),
                    EndTime = new TimeSpan(16, 30, 0),
                    Venue = "Seminary Grand Auditorium & Regional Centers",
                    Speaker = "Pastoral Council & Guest Theologians",
                    Ministry = "Missions & Church Planting",
                    Status = "SCHEDULED",
                    Description = "Equipping bivocational church planters, church revitalizers, and lay elders with sound ecclesiology and strategic church multiplication.",
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    CustomerId = defaultCustId,
                    Title = "41st Annual Seminary Commencement & Commissioning Service",
                    EventType = "Commencement Exercises",
                    EventDate = new DateTime(2027, 3, 27),
                    StartTime = new TimeSpan(14, 0, 0),
                    EndTime = new TimeSpan(18, 0, 0),
                    Venue = "Seminary Cathedral Grounds",
                    Speaker = "Chancellor & Board of Trustees",
                    Ministry = "Academic Council",
                    Status = "SCHEDULED",
                    Description = "Conferral of degrees for Bachelor of Theology (B.Th.), Master of Ministry (M.Min.), and Diploma in Pastoral Studies (DPS).",
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.Events.AddRange(seedEvents);
            await context.SaveChangesAsync();
        }

        // --------------------------------------------------------
        // ANNOUNCEMENTS SEEDING
        // --------------------------------------------------------
        if (!await context.Announcements.AnyAsync())
        {
            var seedAnnouncements = new List<Announcement>
            {
                new Announcement
                {
                    Title = "Now Accepting Applications for Academic Year 2026-2027",
                    Category = "ADMISSIONS",
                    IsPublished = true,
                    PublishDate = new DateTime(2026, 10, 15),
                    CreatedDate = DateTime.UtcNow,
                    Content = "Registration is officially open for modular on-campus intensives and global online seminary cohorts. Early applicant scholarships are available for pastors and church planters."
                },
                new Announcement
                {
                    Title = "MBS Theological LMS 3.0 Platform Upgrade & Cloud Library",
                    Category = "ACADEMIC LMS",
                    IsPublished = true,
                    PublishDate = new DateTime(2026, 10, 10),
                    CreatedDate = DateTime.UtcNow,
                    Content = "Students can now access over 15,000 digital commentaries, exegetical lexicons, and class video replays directly in the student portal."
                },
                new Announcement
                {
                    Title = "80% Subsidized Tuition Grant Active for Full-Time Ministers",
                    Category = "SCHOLARSHIPS",
                    IsPublished = true,
                    PublishDate = new DateTime(2026, 9, 28),
                    CreatedDate = DateTime.UtcNow,
                    Content = "Through generous seminary partners, an 80% tuition subsidy grant is now active for full-time bivocational ministers and rural church workers."
                }
            };
            context.Announcements.AddRange(seedAnnouncements);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        var logger =
            services.GetRequiredService<
                ILogger<Program>>();

        logger.LogError(
            ex,
            "An error occurred while seeding client roles and permissions.");
    }
}


// ============================================================
// CORS HELPER
// ============================================================

static bool IsAllowedOrigin(
    string origin)
{
    if (string.IsNullOrWhiteSpace(origin))
    {
        return true;
    }

    if (origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase) ||
        origin.StartsWith("https://localhost:", StringComparison.OrdinalIgnoreCase))
    {
        return true;
    }

    if (origin.EndsWith(".onrender.com", StringComparison.OrdinalIgnoreCase) ||
        origin.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
    {
        return true;
    }

    return true;
}

