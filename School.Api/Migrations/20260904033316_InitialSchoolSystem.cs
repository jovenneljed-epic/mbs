using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchoolSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    PublishDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Announcements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BlogPosts",
                columns: table => new
                {
                    BlogPostId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Excerpt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CoverImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Author = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PublishDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlogPosts", x => x.BlogPostId);
                });

            migrationBuilder.CreateTable(
                name: "ChurchSettings",
                columns: table => new
                {
                    ChurchSettingsId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChurchName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ChurchCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ContactNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PastorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LogoPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChurchSettings", x => x.ChurchSettingsId);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    CourseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ShortDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EstimatedMinutes = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.CourseId);
                });

            migrationBuilder.CreateTable(
                name: "DemoRequests",
                columns: table => new
                {
                    DemoRequestId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ChurchName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Position = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    AdminNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContactedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DemoDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsConverted = table.Column<bool>(type: "bit", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    ConvertedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DemoRequests", x => x.DemoRequestId);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlans",
                columns: table => new
                {
                    SubscriptionPlanId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MonthlyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AnnualPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TrialDays = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    MaxUsers = table.Column<int>(type: "int", nullable: false, defaultValue: 5),
                    MaxMembers = table.Column<int>(type: "int", nullable: false, defaultValue: 500),
                    IncludesChurchManagement = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IncludesAttendance = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IncludesGiving = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IncludesFinance = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IncludesMinistries = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IncludesEvents = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IncludesEPICLearning = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IncludesReports = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPlans", x => x.SubscriptionPlanId);
                });

            migrationBuilder.CreateTable(
                name: "WebsiteVisits",
                columns: table => new
                {
                    WebsiteVisitId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitorId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PagePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PageTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LandingPage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Referrer = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TrafficSource = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TrafficMedium = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TrafficCampaign = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UtmSource = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UtmMedium = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UtmCampaign = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UtmTerm = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UtmContent = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DeviceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Browser = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OperatingSystem = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ScreenResolution = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Region = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TimeOnPageSeconds = table.Column<int>(type: "int", nullable: true),
                    IsBounce = table.Column<bool>(type: "bit", nullable: false),
                    IsReturningVisitor = table.Column<bool>(type: "bit", nullable: false),
                    VisitedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Language = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TimeZone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebsiteVisits", x => x.WebsiteVisitId);
                });

            migrationBuilder.CreateTable(
                name: "CourseModules",
                columns: table => new
                {
                    CourseModuleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseModules", x => x.CourseModuleId);
                    table.ForeignKey(
                        name: "FK_CourseModules_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    CustomerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChurchName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactPerson = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Active"),
                    DemoRequestId = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.CustomerId);
                    table.ForeignKey(
                        name: "FK_Customers_DemoRequests_DemoRequestId",
                        column: x => x.DemoRequestId,
                        principalTable: "DemoRequests",
                        principalColumn: "DemoRequestId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    PermissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    Module = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CanView = table.Column<bool>(type: "bit", nullable: false),
                    CanCreate = table.Column<bool>(type: "bit", nullable: false),
                    CanEdit = table.Column<bool>(type: "bit", nullable: false),
                    CanDelete = table.Column<bool>(type: "bit", nullable: false),
                    CanExport = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.PermissionId);
                    table.ForeignKey(
                        name: "FK_Permissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Lessons",
                columns: table => new
                {
                    LessonId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseModuleId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VideoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResourceUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    EstimatedMinutes = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    IsFreePreview = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lessons", x => x.LessonId);
                    table.ForeignKey(
                        name: "FK_Lessons_CourseModules_CourseModuleId",
                        column: x => x.CourseModuleId,
                        principalTable: "CourseModules",
                        principalColumn: "CourseModuleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChurchServices",
                columns: table => new
                {
                    ChurchServiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ServiceName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ServiceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ServiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartTime = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EndTime = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ServiceLeader = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Speaker = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "SCHEDULED"),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChurchServices", x => x.ChurchServiceId);
                    table.ForeignKey(
                        name: "FK_ChurchServices_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClientRoles",
                columns: table => new
                {
                    ClientRoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsSystemRole = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientRoles", x => x.ClientRoleId);
                    table.ForeignKey(
                        name: "FK_ClientRoles_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Events",
                columns: table => new
                {
                    EventId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EventDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    Venue = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Speaker = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Ministry = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "SCHEDULED"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Events", x => x.EventId);
                    table.ForeignKey(
                        name: "FK_Events_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    ExpenseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpenseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RecordedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RecordedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.ExpenseId);
                    table.ForeignKey(
                        name: "FK_Expenses_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Incomes",
                columns: table => new
                {
                    IncomeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IncomeDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    RecordedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RecordedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incomes", x => x.IncomeId);
                    table.ForeignKey(
                        name: "FK_Incomes_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Members",
                columns: table => new
                {
                    MemberId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    MemberCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    BirthDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ContactNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CivilStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Ministry = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DateJoined = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "ACTIVE"),
                    PhotoPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Members", x => x.MemberId);
                    table.ForeignKey(
                        name: "FK_Members_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Ministries",
                columns: table => new
                {
                    MinistryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MinistryCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MinistryHead = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ServiceTypeMapping = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MeetingDay = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MeetingTime = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MeetingLocation = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "ACTIVE"),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ministries", x => x.MinistryId);
                    table.ForeignKey(
                        name: "FK_Ministries_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Subscriptions",
                columns: table => new
                {
                    SubscriptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ChurchName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SubscriptionPlanId = table.Column<int>(type: "int", nullable: false),
                    BillingCycle = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Monthly"),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "PHP"),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "TRIAL"),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrialEndsAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextBillingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentCustomerId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PaymentSubscriptionId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscriptions", x => x.SubscriptionId);
                    table.ForeignKey(
                        name: "FK_Subscriptions_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Subscriptions_SubscriptionPlans_SubscriptionPlanId",
                        column: x => x.SubscriptionPlanId,
                        principalTable: "SubscriptionPlans",
                        principalColumn: "SubscriptionPlanId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClientPermissions",
                columns: table => new
                {
                    ClientPermissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientRoleId = table.Column<int>(type: "int", nullable: false),
                    ModuleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CanView = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CanCreate = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CanEdit = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CanDelete = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CanManage = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientPermissions", x => x.ClientPermissionId);
                    table.ForeignKey(
                        name: "FK_ClientPermissions_ClientRoles_ClientRoleId",
                        column: x => x.ClientRoleId,
                        principalTable: "ClientRoles",
                        principalColumn: "ClientRoleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Attendances",
                columns: table => new
                {
                    AttendanceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MemberId = table.Column<int>(type: "int", nullable: false),
                    ChurchServiceId = table.Column<int>(type: "int", nullable: true),
                    EventId = table.Column<int>(type: "int", nullable: true),
                    AttendanceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Service = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    RecordedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RecordedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attendances", x => x.AttendanceId);
                    table.ForeignKey(
                        name: "FK_Attendances_ChurchServices_ChurchServiceId",
                        column: x => x.ChurchServiceId,
                        principalTable: "ChurchServices",
                        principalColumn: "ChurchServiceId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Attendances_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "EventId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Attendances_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClientMembers",
                columns: table => new
                {
                    ClientMemberId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    MemberId = table.Column<int>(type: "int", nullable: false),
                    ClientRoleId = table.Column<int>(type: "int", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "ACTIVE"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ContactNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientMembers", x => x.ClientMemberId);
                    table.ForeignKey(
                        name: "FK_ClientMembers_ClientRoles_ClientRoleId",
                        column: x => x.ClientRoleId,
                        principalTable: "ClientRoles",
                        principalColumn: "ClientRoleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClientMembers_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClientMembers_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CRBreakPasses",
                columns: table => new
                {
                    CRBreakPassId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MemberId = table.Column<int>(type: "int", nullable: false),
                    PassCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    QrToken = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeOut = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TimeIn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CRBreakPasses", x => x.CRBreakPassId);
                    table.ForeignKey(
                        name: "FK_CRBreakPasses_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventChecklists",
                columns: table => new
                {
                    EventChecklistId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    TaskName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AssignedMemberId = table.Column<int>(type: "int", nullable: true),
                    AssignedPerson = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "PENDING"),
                    Priority = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "NORMAL"),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedByMemberId = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventChecklists", x => x.EventChecklistId);
                    table.ForeignKey(
                        name: "FK_EventChecklists_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "EventId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventChecklists_Members_AssignedMemberId",
                        column: x => x.AssignedMemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventChecklists_Members_CompletedByMemberId",
                        column: x => x.CompletedByMemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EventDepartments",
                columns: table => new
                {
                    EventDepartmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    DepartmentName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DepartmentDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DepartmentHeadMemberId = table.Column<int>(type: "int", nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "NORMAL"),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "PLANNING"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventDepartments", x => x.EventDepartmentId);
                    table.ForeignKey(
                        name: "FK_EventDepartments_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "EventId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventDepartments_Members_DepartmentHeadMemberId",
                        column: x => x.DepartmentHeadMemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EventNeeds",
                columns: table => new
                {
                    EventNeedId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    NeedName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 1m),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ResponsiblePerson = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ResponsibleMemberId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "PENDING"),
                    Priority = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "NORMAL"),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NeededBy = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventNeeds", x => x.EventNeedId);
                    table.ForeignKey(
                        name: "FK_EventNeeds_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "EventId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventNeeds_Members_ResponsibleMemberId",
                        column: x => x.ResponsibleMemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Givings",
                columns: table => new
                {
                    GivingId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    MemberId = table.Column<int>(type: "int", nullable: true),
                    ChurchServiceId = table.Column<int>(type: "int", nullable: true),
                    GivingType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GivingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RecordedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RecordedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Givings", x => x.GivingId);
                    table.ForeignKey(
                        name: "FK_Givings_ChurchServices_ChurchServiceId",
                        column: x => x.ChurchServiceId,
                        principalTable: "ChurchServices",
                        principalColumn: "ChurchServiceId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Givings_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Givings_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    MemberId = table.Column<int>(type: "int", nullable: true),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "APPROVED"),
                    AccountType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LastLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PasswordChangedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_Users_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Users_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Visitors",
                columns: table => new
                {
                    VisitorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    VisitorCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BirthDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ContactNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    InvitedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ministry = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FirstVisitDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VisitCount = table.Column<int>(type: "int", nullable: false),
                    FollowUpStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsConvertedToMember = table.Column<bool>(type: "bit", nullable: false),
                    ConvertedMemberId = table.Column<int>(type: "int", nullable: true),
                    ConversionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visitors", x => x.VisitorId);
                    table.ForeignKey(
                        name: "FK_Visitors_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Visitors_Members_ConvertedMemberId",
                        column: x => x.ConvertedMemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId");
                });

            migrationBuilder.CreateTable(
                name: "MinistryMembers",
                columns: table => new
                {
                    MinistryMemberId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MinistryId = table.Column<int>(type: "int", nullable: false),
                    MemberId = table.Column<int>(type: "int", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Position = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "ACTIVE"),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DateAssigned = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateEnded = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MinistryMembers", x => x.MinistryMemberId);
                    table.ForeignKey(
                        name: "FK_MinistryMembers_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MinistryMembers_Ministries_MinistryId",
                        column: x => x.MinistryId,
                        principalTable: "Ministries",
                        principalColumn: "MinistryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    PaymentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubscriptionId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "PHP"),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Manual"),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "PENDING"),
                    ReferenceNumber = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    GatewayPaymentId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    GatewayCheckoutId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    GatewayCustomerId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PaidDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BillingPeriodStart = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BillingPeriodEnd = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReceiptNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    PaymentProofFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PaymentProofContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentProofData = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    PaymentProofUploadedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.PaymentId);
                    table.ForeignKey(
                        name: "FK_Payments_Subscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalTable: "Subscriptions",
                        principalColumn: "SubscriptionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventRoles",
                columns: table => new
                {
                    EventRoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventDepartmentId = table.Column<int>(type: "int", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RoleDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "NORMAL"),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "ACTIVE"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventRoles", x => x.EventRoleId);
                    table.ForeignKey(
                        name: "FK_EventRoles_EventDepartments_EventDepartmentId",
                        column: x => x.EventDepartmentId,
                        principalTable: "EventDepartments",
                        principalColumn: "EventDepartmentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Certificates",
                columns: table => new
                {
                    CertificateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CertificateNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RecipientName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CourseTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IssuedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CertificateUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certificates", x => x.CertificateId);
                    table.ForeignKey(
                        name: "FK_Certificates_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Certificates_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CourseEnrollments",
                columns: table => new
                {
                    CourseEnrollmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    EnrolledDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    ProgressPercentage = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseEnrollments", x => x.CourseEnrollmentId);
                    table.ForeignKey(
                        name: "FK_CourseEnrollments_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseEnrollments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VisitorAttendances",
                columns: table => new
                {
                    VisitorAttendanceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitorId = table.Column<int>(type: "int", nullable: false),
                    ChurchServiceId = table.Column<int>(type: "int", nullable: false),
                    AttendanceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "PRESENT"),
                    RecordedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RecordedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitorAttendances", x => x.VisitorAttendanceId);
                    table.ForeignKey(
                        name: "FK_VisitorAttendances_ChurchServices_ChurchServiceId",
                        column: x => x.ChurchServiceId,
                        principalTable: "ChurchServices",
                        principalColumn: "ChurchServiceId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VisitorAttendances_Visitors_VisitorId",
                        column: x => x.VisitorId,
                        principalTable: "Visitors",
                        principalColumn: "VisitorId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MinistryPerformanceRatings",
                columns: table => new
                {
                    PerformanceRatingId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MinistryMemberId = table.Column<int>(type: "int", nullable: false),
                    EvaluationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AttendanceRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    CommitmentRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    ParticipationRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    TeamworkRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    SpiritualGrowthRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    LeadershipRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    ResponsibilityRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    OverallRating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    Strengths = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    AreasForImprovement = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Recommendations = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Evaluator = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MinistryPerformanceRatings", x => x.PerformanceRatingId);
                    table.ForeignKey(
                        name: "FK_MinistryPerformanceRatings_MinistryMembers_MinistryMemberId",
                        column: x => x.MinistryMemberId,
                        principalTable: "MinistryMembers",
                        principalColumn: "MinistryMemberId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventAssignments",
                columns: table => new
                {
                    EventAssignmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    EventDepartmentId = table.Column<int>(type: "int", nullable: true),
                    EventRoleId = table.Column<int>(type: "int", nullable: true),
                    MemberId = table.Column<int>(type: "int", nullable: true),
                    AssignedPerson = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DepartmentName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    RoleName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    AssignmentStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "PENDING"),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "NORMAL"),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventAssignments", x => x.EventAssignmentId);
                    table.ForeignKey(
                        name: "FK_EventAssignments_EventDepartments_EventDepartmentId",
                        column: x => x.EventDepartmentId,
                        principalTable: "EventDepartments",
                        principalColumn: "EventDepartmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventAssignments_EventRoles_EventRoleId",
                        column: x => x.EventRoleId,
                        principalTable: "EventRoles",
                        principalColumn: "EventRoleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventAssignments_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "EventId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventAssignments_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "MemberId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LessonProgresses",
                columns: table => new
                {
                    LessonProgressId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseEnrollmentId = table.Column<int>(type: "int", nullable: false),
                    LessonId = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    ProgressPercentage = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    StartedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonProgresses", x => x.LessonProgressId);
                    table.ForeignKey(
                        name: "FK_LessonProgresses_CourseEnrollments_CourseEnrollmentId",
                        column: x => x.CourseEnrollmentId,
                        principalTable: "CourseEnrollments",
                        principalColumn: "CourseEnrollmentId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonProgresses_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "LessonId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_ChurchServiceId",
                table: "Attendances",
                column: "ChurchServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_EventId",
                table: "Attendances",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_MemberId_ChurchServiceId",
                table: "Attendances",
                columns: new[] { "MemberId", "ChurchServiceId" },
                unique: true,
                filter: "[ChurchServiceId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_MemberId_EventId",
                table: "Attendances",
                columns: new[] { "MemberId", "EventId" },
                unique: true,
                filter: "[EventId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_CertificateNumber",
                table: "Certificates",
                column: "CertificateNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_CourseId",
                table: "Certificates",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_UserId",
                table: "Certificates",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChurchServices_CustomerId",
                table: "ChurchServices",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ChurchServices_CustomerId_ServiceDate",
                table: "ChurchServices",
                columns: new[] { "CustomerId", "ServiceDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ChurchServices_ServiceDate",
                table: "ChurchServices",
                column: "ServiceDate");

            migrationBuilder.CreateIndex(
                name: "IX_ChurchServices_ServiceType",
                table: "ChurchServices",
                column: "ServiceType");

            migrationBuilder.CreateIndex(
                name: "IX_ChurchServices_Status",
                table: "ChurchServices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ClientMembers_ClientRoleId",
                table: "ClientMembers",
                column: "ClientRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientMembers_CustomerId",
                table: "ClientMembers",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientMembers_CustomerId_MemberId",
                table: "ClientMembers",
                columns: new[] { "CustomerId", "MemberId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClientMembers_MemberId",
                table: "ClientMembers",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientPermissions_ClientRoleId_ModuleName",
                table: "ClientPermissions",
                columns: new[] { "ClientRoleId", "ModuleName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClientRoles_CustomerId",
                table: "ClientRoles",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientRoles_CustomerId_RoleName",
                table: "ClientRoles",
                columns: new[] { "CustomerId", "RoleName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseEnrollments_CourseId_UserId",
                table: "CourseEnrollments",
                columns: new[] { "CourseId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseEnrollments_UserId",
                table: "CourseEnrollments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseModules_CourseId",
                table: "CourseModules",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CRBreakPasses_MemberId",
                table: "CRBreakPasses",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_CreatedDate",
                table: "Customers",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_DemoRequestId",
                table: "Customers",
                column: "DemoRequestId",
                unique: true,
                filter: "[DemoRequestId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Email",
                table: "Customers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Status",
                table: "Customers",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DemoRequests_CreatedDate",
                table: "DemoRequests",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_DemoRequests_Status",
                table: "DemoRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_EventAssignments_AssignmentStatus",
                table: "EventAssignments",
                column: "AssignmentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_EventAssignments_EventDepartmentId",
                table: "EventAssignments",
                column: "EventDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_EventAssignments_EventId",
                table: "EventAssignments",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventAssignments_EventRoleId",
                table: "EventAssignments",
                column: "EventRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_EventAssignments_MemberId",
                table: "EventAssignments",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_EventAssignments_Priority",
                table: "EventAssignments",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_EventChecklists_AssignedMemberId",
                table: "EventChecklists",
                column: "AssignedMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_EventChecklists_Category",
                table: "EventChecklists",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_EventChecklists_CompletedByMemberId",
                table: "EventChecklists",
                column: "CompletedByMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_EventChecklists_DueDate",
                table: "EventChecklists",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_EventChecklists_EventId",
                table: "EventChecklists",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventChecklists_Priority",
                table: "EventChecklists",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_EventChecklists_SortOrder",
                table: "EventChecklists",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_EventChecklists_Status",
                table: "EventChecklists",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_EventDepartments_DepartmentHeadMemberId",
                table: "EventDepartments",
                column: "DepartmentHeadMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_EventDepartments_EventId",
                table: "EventDepartments",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventDepartments_EventId_DepartmentName",
                table: "EventDepartments",
                columns: new[] { "EventId", "DepartmentName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventDepartments_Priority",
                table: "EventDepartments",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_EventDepartments_Status",
                table: "EventDepartments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_EventNeeds_Category",
                table: "EventNeeds",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_EventNeeds_EventId",
                table: "EventNeeds",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventNeeds_NeededBy",
                table: "EventNeeds",
                column: "NeededBy");

            migrationBuilder.CreateIndex(
                name: "IX_EventNeeds_Priority",
                table: "EventNeeds",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_EventNeeds_ResponsibleMemberId",
                table: "EventNeeds",
                column: "ResponsibleMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_EventNeeds_Status",
                table: "EventNeeds",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_EventRoles_EventDepartmentId",
                table: "EventRoles",
                column: "EventDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_EventRoles_EventDepartmentId_RoleName",
                table: "EventRoles",
                columns: new[] { "EventDepartmentId", "RoleName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventRoles_Priority",
                table: "EventRoles",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_EventRoles_RoleName",
                table: "EventRoles",
                column: "RoleName");

            migrationBuilder.CreateIndex(
                name: "IX_EventRoles_Status",
                table: "EventRoles",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Events_CustomerId",
                table: "Events",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Events_CustomerId_EventDate",
                table: "Events",
                columns: new[] { "CustomerId", "EventDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Events_EventDate",
                table: "Events",
                column: "EventDate");

            migrationBuilder.CreateIndex(
                name: "IX_Events_EventType",
                table: "Events",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_Events_Status",
                table: "Events",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_Category",
                table: "Expenses",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CustomerId",
                table: "Expenses",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CustomerId_ExpenseDate",
                table: "Expenses",
                columns: new[] { "CustomerId", "ExpenseDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_ExpenseDate",
                table: "Expenses",
                column: "ExpenseDate");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_PaymentMethod",
                table: "Expenses",
                column: "PaymentMethod");

            migrationBuilder.CreateIndex(
                name: "IX_Givings_ChurchServiceId",
                table: "Givings",
                column: "ChurchServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Givings_CustomerId",
                table: "Givings",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Givings_GivingDate",
                table: "Givings",
                column: "GivingDate");

            migrationBuilder.CreateIndex(
                name: "IX_Givings_GivingType",
                table: "Givings",
                column: "GivingType");

            migrationBuilder.CreateIndex(
                name: "IX_Givings_MemberId",
                table: "Givings",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Givings_PaymentMethod",
                table: "Givings",
                column: "PaymentMethod");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_Category",
                table: "Incomes",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_CustomerId",
                table: "Incomes",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_CustomerId_IncomeDate",
                table: "Incomes",
                columns: new[] { "CustomerId", "IncomeDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_IncomeDate",
                table: "Incomes",
                column: "IncomeDate");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_PaymentMethod",
                table: "Incomes",
                column: "PaymentMethod");

            migrationBuilder.CreateIndex(
                name: "IX_LessonProgresses_CourseEnrollmentId_LessonId",
                table: "LessonProgresses",
                columns: new[] { "CourseEnrollmentId", "LessonId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LessonProgresses_LessonId",
                table: "LessonProgresses",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_CourseModuleId",
                table: "Lessons",
                column: "CourseModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_Members_CustomerId",
                table: "Members",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Members_CustomerId_MemberCode",
                table: "Members",
                columns: new[] { "CustomerId", "MemberCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ministries_CustomerId",
                table: "Ministries",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Ministries_CustomerId_Name",
                table: "Ministries",
                columns: new[] { "CustomerId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_MinistryMembers_MemberId",
                table: "MinistryMembers",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_MinistryMembers_MinistryId",
                table: "MinistryMembers",
                column: "MinistryId");

            migrationBuilder.CreateIndex(
                name: "IX_MinistryMembers_MinistryId_MemberId",
                table: "MinistryMembers",
                columns: new[] { "MinistryId", "MemberId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MinistryMembers_Status",
                table: "MinistryMembers",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MinistryPerformanceRatings_MinistryMemberId",
                table: "MinistryPerformanceRatings",
                column: "MinistryMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CreatedDate",
                table: "Payments",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_GatewayPaymentId",
                table: "Payments",
                column: "GatewayPaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReferenceNumber",
                table: "Payments",
                column: "ReferenceNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_Status",
                table: "Payments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_SubscriptionId",
                table: "Payments",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_RoleId_Module",
                table: "Permissions",
                columns: new[] { "RoleId", "Module" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_RoleName",
                table: "Roles",
                column: "RoleName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_ContactEmail",
                table: "Subscriptions",
                column: "ContactEmail");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_CreatedDate",
                table: "Subscriptions",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_CustomerId",
                table: "Subscriptions",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_Status",
                table: "Subscriptions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_SubscriptionPlanId",
                table: "Subscriptions",
                column: "SubscriptionPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ApprovalStatus",
                table: "Users",
                column: "ApprovalStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CustomerId",
                table: "Users",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_IsActive",
                table: "Users",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Users_MemberId",
                table: "Users",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VisitorAttendances_AttendanceDate",
                table: "VisitorAttendances",
                column: "AttendanceDate");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorAttendances_ChurchServiceId",
                table: "VisitorAttendances",
                column: "ChurchServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorAttendances_Status",
                table: "VisitorAttendances",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorAttendances_VisitorId",
                table: "VisitorAttendances",
                column: "VisitorId");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorAttendances_VisitorId_ChurchServiceId",
                table: "VisitorAttendances",
                columns: new[] { "VisitorId", "ChurchServiceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Visitors_ConvertedMemberId",
                table: "Visitors",
                column: "ConvertedMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Visitors_CustomerId",
                table: "Visitors",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Visitors_VisitorCode",
                table: "Visitors",
                column: "VisitorCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteVisits_Country",
                table: "WebsiteVisits",
                column: "Country");

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteVisits_DeviceType",
                table: "WebsiteVisits",
                column: "DeviceType");

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteVisits_PagePath",
                table: "WebsiteVisits",
                column: "PagePath");

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteVisits_SessionId",
                table: "WebsiteVisits",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteVisits_TrafficMedium",
                table: "WebsiteVisits",
                column: "TrafficMedium");

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteVisits_TrafficSource",
                table: "WebsiteVisits",
                column: "TrafficSource");

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteVisits_UtmCampaign",
                table: "WebsiteVisits",
                column: "UtmCampaign");

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteVisits_VisitedAt",
                table: "WebsiteVisits",
                column: "VisitedAt");

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteVisits_VisitorId",
                table: "WebsiteVisits",
                column: "VisitorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.DropTable(
                name: "Attendances");

            migrationBuilder.DropTable(
                name: "BlogPosts");

            migrationBuilder.DropTable(
                name: "Certificates");

            migrationBuilder.DropTable(
                name: "ChurchSettings");

            migrationBuilder.DropTable(
                name: "ClientMembers");

            migrationBuilder.DropTable(
                name: "ClientPermissions");

            migrationBuilder.DropTable(
                name: "CRBreakPasses");

            migrationBuilder.DropTable(
                name: "EventAssignments");

            migrationBuilder.DropTable(
                name: "EventChecklists");

            migrationBuilder.DropTable(
                name: "EventNeeds");

            migrationBuilder.DropTable(
                name: "Expenses");

            migrationBuilder.DropTable(
                name: "Givings");

            migrationBuilder.DropTable(
                name: "Incomes");

            migrationBuilder.DropTable(
                name: "LessonProgresses");

            migrationBuilder.DropTable(
                name: "MinistryPerformanceRatings");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "VisitorAttendances");

            migrationBuilder.DropTable(
                name: "WebsiteVisits");

            migrationBuilder.DropTable(
                name: "ClientRoles");

            migrationBuilder.DropTable(
                name: "EventRoles");

            migrationBuilder.DropTable(
                name: "CourseEnrollments");

            migrationBuilder.DropTable(
                name: "Lessons");

            migrationBuilder.DropTable(
                name: "MinistryMembers");

            migrationBuilder.DropTable(
                name: "Subscriptions");

            migrationBuilder.DropTable(
                name: "ChurchServices");

            migrationBuilder.DropTable(
                name: "Visitors");

            migrationBuilder.DropTable(
                name: "EventDepartments");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "CourseModules");

            migrationBuilder.DropTable(
                name: "Ministries");

            migrationBuilder.DropTable(
                name: "SubscriptionPlans");

            migrationBuilder.DropTable(
                name: "Events");

            migrationBuilder.DropTable(
                name: "Members");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "DemoRequests");
        }
    }
}
