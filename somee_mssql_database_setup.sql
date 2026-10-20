IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Announcements] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(max) NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [Category] nvarchar(max) NOT NULL,
        [ImageUrl] nvarchar(max) NULL,
        [IsPublished] bit NOT NULL,
        [PublishDate] datetime2 NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Announcements] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [BlogPosts] (
        [BlogPostId] int NOT NULL IDENTITY,
        [Title] nvarchar(max) NOT NULL,
        [Slug] nvarchar(max) NOT NULL,
        [Category] nvarchar(max) NOT NULL,
        [Excerpt] nvarchar(max) NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [CoverImage] nvarchar(max) NULL,
        [Author] nvarchar(max) NOT NULL,
        [IsPublished] bit NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        [PublishDate] datetime2 NULL,
        CONSTRAINT [PK_BlogPosts] PRIMARY KEY ([BlogPostId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [ChurchSettings] (
        [ChurchSettingsId] int NOT NULL IDENTITY,
        [ChurchName] nvarchar(200) NOT NULL,
        [ChurchCode] nvarchar(50) NOT NULL,
        [Address] nvarchar(500) NOT NULL,
        [ContactNumber] nvarchar(50) NOT NULL,
        [Email] nvarchar(150) NOT NULL,
        [PastorName] nvarchar(200) NOT NULL,
        [LogoPath] nvarchar(500) NOT NULL,
        [UpdatedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_ChurchSettings] PRIMARY KEY ([ChurchSettingsId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Courses] (
        [CourseId] int NOT NULL IDENTITY,
        [Title] nvarchar(200) NOT NULL,
        [ShortDescription] nvarchar(500) NULL,
        [Description] nvarchar(max) NULL,
        [ThumbnailUrl] nvarchar(500) NULL,
        [Category] nvarchar(100) NULL,
        [Level] nvarchar(50) NULL,
        [EstimatedMinutes] int NOT NULL,
        [IsPublished] bit NOT NULL,
        [IsFeatured] bit NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_Courses] PRIMARY KEY ([CourseId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [DemoRequests] (
        [DemoRequestId] int NOT NULL IDENTITY,
        [FullName] nvarchar(150) NOT NULL,
        [ChurchName] nvarchar(200) NOT NULL,
        [Email] nvarchar(200) NOT NULL,
        [Phone] nvarchar(50) NULL,
        [Position] nvarchar(100) NULL,
        [Message] nvarchar(1000) NULL,
        [Status] nvarchar(50) NOT NULL DEFAULT N'Pending',
        [AdminNotes] nvarchar(2000) NULL,
        [CreatedDate] datetime2 NOT NULL,
        [ContactedDate] datetime2 NULL,
        [DemoDate] datetime2 NULL,
        [IsConverted] bit NOT NULL,
        [CustomerId] int NULL,
        [ConvertedDate] datetime2 NULL,
        CONSTRAINT [PK_DemoRequests] PRIMARY KEY ([DemoRequestId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Roles] (
        [RoleId] int NOT NULL IDENTITY,
        [RoleName] nvarchar(100) NOT NULL,
        [Description] nvarchar(250) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([RoleId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [SubscriptionPlans] (
        [SubscriptionPlanId] int NOT NULL IDENTITY,
        [PlanName] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [MonthlyPrice] decimal(18,2) NOT NULL,
        [AnnualPrice] decimal(18,2) NOT NULL,
        [TrialDays] int NOT NULL DEFAULT 0,
        [MaxUsers] int NOT NULL DEFAULT 5,
        [MaxMembers] int NOT NULL DEFAULT 500,
        [IncludesChurchManagement] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IncludesAttendance] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IncludesGiving] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IncludesFinance] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IncludesMinistries] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IncludesEvents] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IncludesEPICLearning] bit NOT NULL DEFAULT CAST(0 AS bit),
        [IncludesReports] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [SortOrder] int NOT NULL DEFAULT 0,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_SubscriptionPlans] PRIMARY KEY ([SubscriptionPlanId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [WebsiteVisits] (
        [WebsiteVisitId] bigint NOT NULL IDENTITY,
        [VisitorId] nvarchar(100) NOT NULL,
        [SessionId] nvarchar(100) NOT NULL,
        [PageUrl] nvarchar(500) NOT NULL,
        [PagePath] nvarchar(500) NULL,
        [PageTitle] nvarchar(200) NULL,
        [LandingPage] nvarchar(500) NULL,
        [Referrer] nvarchar(1000) NULL,
        [TrafficSource] nvarchar(100) NULL,
        [TrafficMedium] nvarchar(100) NULL,
        [TrafficCampaign] nvarchar(200) NULL,
        [UtmSource] nvarchar(200) NULL,
        [UtmMedium] nvarchar(200) NULL,
        [UtmCampaign] nvarchar(200) NULL,
        [UtmTerm] nvarchar(200) NULL,
        [UtmContent] nvarchar(200) NULL,
        [DeviceType] nvarchar(50) NULL,
        [Browser] nvarchar(100) NULL,
        [OperatingSystem] nvarchar(100) NULL,
        [ScreenResolution] nvarchar(50) NULL,
        [Country] nvarchar(100) NULL,
        [Region] nvarchar(100) NULL,
        [City] nvarchar(100) NULL,
        [TimeOnPageSeconds] int NULL,
        [IsBounce] bit NOT NULL,
        [IsReturningVisitor] bit NOT NULL,
        [VisitedAt] datetime2 NOT NULL,
        [LastActivityAt] datetime2 NULL,
        [UserAgent] nvarchar(1000) NULL,
        [Language] nvarchar(100) NULL,
        [TimeZone] nvarchar(50) NULL,
        CONSTRAINT [PK_WebsiteVisits] PRIMARY KEY ([WebsiteVisitId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [CourseModules] (
        [CourseModuleId] int NOT NULL IDENTITY,
        [CourseId] int NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(max) NULL,
        [SortOrder] int NOT NULL,
        [IsPublished] bit NOT NULL,
        CONSTRAINT [PK_CourseModules] PRIMARY KEY ([CourseModuleId]),
        CONSTRAINT [FK_CourseModules_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([CourseId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Customers] (
        [CustomerId] int NOT NULL IDENTITY,
        [ChurchName] nvarchar(200) NOT NULL,
        [ContactPerson] nvarchar(150) NOT NULL,
        [Email] nvarchar(200) NOT NULL,
        [Phone] nvarchar(50) NULL,
        [Status] nvarchar(50) NOT NULL DEFAULT N'Active',
        [DemoRequestId] int NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([CustomerId]),
        CONSTRAINT [FK_Customers_DemoRequests_DemoRequestId] FOREIGN KEY ([DemoRequestId]) REFERENCES [DemoRequests] ([DemoRequestId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Permissions] (
        [PermissionId] int NOT NULL IDENTITY,
        [RoleId] int NOT NULL,
        [Module] nvarchar(100) NOT NULL,
        [CanView] bit NOT NULL,
        [CanCreate] bit NOT NULL,
        [CanEdit] bit NOT NULL,
        [CanDelete] bit NOT NULL,
        [CanExport] bit NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Permissions] PRIMARY KEY ([PermissionId]),
        CONSTRAINT [FK_Permissions_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([RoleId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Lessons] (
        [LessonId] int NOT NULL IDENTITY,
        [CourseModuleId] int NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Content] nvarchar(max) NULL,
        [VideoUrl] nvarchar(500) NULL,
        [ResourceUrl] nvarchar(500) NULL,
        [SortOrder] int NOT NULL,
        [EstimatedMinutes] int NOT NULL,
        [IsPublished] bit NOT NULL,
        [IsFreePreview] bit NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_Lessons] PRIMARY KEY ([LessonId]),
        CONSTRAINT [FK_Lessons_CourseModules_CourseModuleId] FOREIGN KEY ([CourseModuleId]) REFERENCES [CourseModules] ([CourseModuleId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [ChurchServices] (
        [ChurchServiceId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [ServiceName] nvarchar(150) NOT NULL,
        [ServiceType] nvarchar(50) NOT NULL,
        [ServiceDate] datetime2 NOT NULL,
        [StartTime] nvarchar(50) NOT NULL,
        [EndTime] nvarchar(50) NOT NULL,
        [Location] nvarchar(200) NOT NULL,
        [ServiceLeader] nvarchar(150) NOT NULL,
        [Speaker] nvarchar(150) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Status] nvarchar(50) NOT NULL DEFAULT N'SCHEDULED',
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_ChurchServices] PRIMARY KEY ([ChurchServiceId]),
        CONSTRAINT [FK_ChurchServices_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [ClientRoles] (
        [ClientRoleId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [RoleName] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NULL,
        [IsSystemRole] bit NOT NULL DEFAULT CAST(0 AS bit),
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_ClientRoles] PRIMARY KEY ([ClientRoleId]),
        CONSTRAINT [FK_ClientRoles_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Events] (
        [EventId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [EventType] nvarchar(100) NOT NULL,
        [EventDate] datetime2 NOT NULL,
        [StartTime] time NOT NULL,
        [EndTime] time NULL,
        [Venue] nvarchar(200) NULL,
        [Speaker] nvarchar(200) NULL,
        [Ministry] nvarchar(150) NULL,
        [Status] nvarchar(50) NOT NULL DEFAULT N'SCHEDULED',
        [Description] nvarchar(max) NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Events] PRIMARY KEY ([EventId]),
        CONSTRAINT [FK_Events_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Expenses] (
        [ExpenseId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [Category] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [ExpenseDate] datetime2 NOT NULL,
        [PaymentMethod] nvarchar(50) NOT NULL,
        [ReferenceNumber] nvarchar(100) NULL,
        [RecordedBy] nvarchar(150) NOT NULL,
        [RecordedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Expenses] PRIMARY KEY ([ExpenseId]),
        CONSTRAINT [FK_Expenses_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Incomes] (
        [IncomeId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [Category] nvarchar(50) NOT NULL,
        [Description] nvarchar(250) NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [IncomeDate] datetime2 NOT NULL,
        [PaymentMethod] nvarchar(100) NOT NULL,
        [ReferenceNumber] nvarchar(250) NOT NULL,
        [RecordedBy] nvarchar(150) NOT NULL,
        [RecordedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Incomes] PRIMARY KEY ([IncomeId]),
        CONSTRAINT [FK_Incomes_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Members] (
        [MemberId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [MemberCode] nvarchar(50) NOT NULL,
        [FirstName] nvarchar(100) NOT NULL,
        [MiddleName] nvarchar(100) NOT NULL,
        [LastName] nvarchar(100) NOT NULL,
        [Gender] nvarchar(30) NOT NULL,
        [BirthDate] datetime2 NULL,
        [ContactNumber] nvarchar(50) NOT NULL,
        [Address] nvarchar(500) NOT NULL,
        [CivilStatus] nvarchar(50) NOT NULL,
        [Ministry] nvarchar(150) NOT NULL,
        [DateJoined] datetime2 NULL,
        [Status] nvarchar(30) NOT NULL DEFAULT N'ACTIVE',
        [PhotoPath] nvarchar(500) NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_Members] PRIMARY KEY ([MemberId]),
        CONSTRAINT [FK_Members_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Ministries] (
        [MinistryId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [Name] nvarchar(150) NOT NULL,
        [MinistryCode] nvarchar(50) NULL,
        [MinistryHead] nvarchar(100) NULL,
        [ContactNumber] nvarchar(50) NULL,
        [Description] nvarchar(500) NULL,
        [ServiceTypeMapping] nvarchar(100) NULL,
        [MeetingDay] nvarchar(50) NULL,
        [MeetingTime] nvarchar(50) NULL,
        [MeetingLocation] nvarchar(250) NULL,
        [Status] nvarchar(50) NOT NULL DEFAULT N'ACTIVE',
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_Ministries] PRIMARY KEY ([MinistryId]),
        CONSTRAINT [FK_Ministries_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Subscriptions] (
        [SubscriptionId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [ChurchName] nvarchar(200) NOT NULL,
        [ContactName] nvarchar(200) NOT NULL,
        [ContactEmail] nvarchar(200) NOT NULL,
        [ContactPhone] nvarchar(50) NOT NULL,
        [SubscriptionPlanId] int NOT NULL,
        [BillingCycle] nvarchar(20) NOT NULL DEFAULT N'Monthly',
        [Amount] decimal(18,2) NOT NULL,
        [Currency] nvarchar(10) NOT NULL DEFAULT N'PHP',
        [Status] nvarchar(30) NOT NULL DEFAULT N'TRIAL',
        [StartDate] datetime2 NOT NULL,
        [TrialEndsAt] datetime2 NULL,
        [EndDate] datetime2 NULL,
        [NextBillingDate] datetime2 NULL,
        [CancelledDate] datetime2 NULL,
        [PaymentCustomerId] nvarchar(200) NULL,
        [PaymentSubscriptionId] nvarchar(200) NULL,
        [Notes] nvarchar(2000) NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_Subscriptions] PRIMARY KEY ([SubscriptionId]),
        CONSTRAINT [FK_Subscriptions_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Subscriptions_SubscriptionPlans_SubscriptionPlanId] FOREIGN KEY ([SubscriptionPlanId]) REFERENCES [SubscriptionPlans] ([SubscriptionPlanId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [ClientPermissions] (
        [ClientPermissionId] int NOT NULL IDENTITY,
        [ClientRoleId] int NOT NULL,
        [ModuleName] nvarchar(100) NOT NULL,
        [CanView] bit NOT NULL DEFAULT CAST(0 AS bit),
        [CanCreate] bit NOT NULL DEFAULT CAST(0 AS bit),
        [CanEdit] bit NOT NULL DEFAULT CAST(0 AS bit),
        [CanDelete] bit NOT NULL DEFAULT CAST(0 AS bit),
        [CanManage] bit NOT NULL DEFAULT CAST(0 AS bit),
        [CreatedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_ClientPermissions] PRIMARY KEY ([ClientPermissionId]),
        CONSTRAINT [FK_ClientPermissions_ClientRoles_ClientRoleId] FOREIGN KEY ([ClientRoleId]) REFERENCES [ClientRoles] ([ClientRoleId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Attendances] (
        [AttendanceId] int NOT NULL IDENTITY,
        [MemberId] int NOT NULL,
        [ChurchServiceId] int NULL,
        [EventId] int NULL,
        [AttendanceDate] datetime2 NOT NULL,
        [Service] nvarchar(max) NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [RecordedBy] nvarchar(150) NOT NULL,
        [RecordedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Attendances] PRIMARY KEY ([AttendanceId]),
        CONSTRAINT [FK_Attendances_ChurchServices_ChurchServiceId] FOREIGN KEY ([ChurchServiceId]) REFERENCES [ChurchServices] ([ChurchServiceId]) ON DELETE SET NULL,
        CONSTRAINT [FK_Attendances_Events_EventId] FOREIGN KEY ([EventId]) REFERENCES [Events] ([EventId]) ON DELETE SET NULL,
        CONSTRAINT [FK_Attendances_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [ClientMembers] (
        [ClientMemberId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [MemberId] int NOT NULL,
        [ClientRoleId] int NOT NULL,
        [Username] nvarchar(100) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [Status] nvarchar(30) NOT NULL DEFAULT N'ACTIVE',
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [CreatedDate] datetime2 NOT NULL,
        [LastLoginDate] datetime2 NULL,
        [Email] nvarchar(200) NULL,
        [ContactNumber] nvarchar(20) NULL,
        CONSTRAINT [PK_ClientMembers] PRIMARY KEY ([ClientMemberId]),
        CONSTRAINT [FK_ClientMembers_ClientRoles_ClientRoleId] FOREIGN KEY ([ClientRoleId]) REFERENCES [ClientRoles] ([ClientRoleId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ClientMembers_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ClientMembers_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [CRBreakPasses] (
        [CRBreakPassId] int NOT NULL IDENTITY,
        [MemberId] int NOT NULL,
        [PassCode] nvarchar(100) NOT NULL,
        [QrToken] nvarchar(200) NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [IssuedAt] datetime2 NOT NULL,
        [TimeOut] datetime2 NULL,
        [TimeIn] datetime2 NULL,
        [ExpiresAt] datetime2 NULL,
        [CreatedBy] nvarchar(150) NULL,
        CONSTRAINT [PK_CRBreakPasses] PRIMARY KEY ([CRBreakPassId]),
        CONSTRAINT [FK_CRBreakPasses_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [EventChecklists] (
        [EventChecklistId] int NOT NULL IDENTITY,
        [EventId] int NOT NULL,
        [TaskName] nvarchar(300) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [Category] nvarchar(100) NULL,
        [AssignedMemberId] int NULL,
        [AssignedPerson] nvarchar(200) NULL,
        [Status] nvarchar(30) NOT NULL DEFAULT N'PENDING',
        [Priority] nvarchar(20) NOT NULL DEFAULT N'NORMAL',
        [SortOrder] int NOT NULL DEFAULT 0,
        [DueDate] datetime2 NULL,
        [CompletedAt] datetime2 NULL,
        [CompletedByMemberId] int NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_EventChecklists] PRIMARY KEY ([EventChecklistId]),
        CONSTRAINT [FK_EventChecklists_Events_EventId] FOREIGN KEY ([EventId]) REFERENCES [Events] ([EventId]) ON DELETE CASCADE,
        CONSTRAINT [FK_EventChecklists_Members_AssignedMemberId] FOREIGN KEY ([AssignedMemberId]) REFERENCES [Members] ([MemberId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_EventChecklists_Members_CompletedByMemberId] FOREIGN KEY ([CompletedByMemberId]) REFERENCES [Members] ([MemberId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [EventDepartments] (
        [EventDepartmentId] int NOT NULL IDENTITY,
        [EventId] int NOT NULL,
        [DepartmentName] nvarchar(150) NOT NULL,
        [DepartmentDescription] nvarchar(500) NULL,
        [DepartmentHeadMemberId] int NULL,
        [Priority] nvarchar(20) NOT NULL DEFAULT N'NORMAL',
        [Status] nvarchar(30) NOT NULL DEFAULT N'PLANNING',
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_EventDepartments] PRIMARY KEY ([EventDepartmentId]),
        CONSTRAINT [FK_EventDepartments_Events_EventId] FOREIGN KEY ([EventId]) REFERENCES [Events] ([EventId]) ON DELETE CASCADE,
        CONSTRAINT [FK_EventDepartments_Members_DepartmentHeadMemberId] FOREIGN KEY ([DepartmentHeadMemberId]) REFERENCES [Members] ([MemberId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [EventNeeds] (
        [EventNeedId] int NOT NULL IDENTITY,
        [EventId] int NOT NULL,
        [NeedName] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [Category] nvarchar(100) NULL,
        [Quantity] decimal(18,2) NOT NULL DEFAULT 1.0,
        [Unit] nvarchar(50) NULL,
        [ResponsiblePerson] nvarchar(200) NULL,
        [ResponsibleMemberId] int NULL,
        [Status] nvarchar(30) NOT NULL DEFAULT N'PENDING',
        [Priority] nvarchar(20) NOT NULL DEFAULT N'NORMAL',
        [Notes] nvarchar(max) NULL,
        [NeededBy] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_EventNeeds] PRIMARY KEY ([EventNeedId]),
        CONSTRAINT [FK_EventNeeds_Events_EventId] FOREIGN KEY ([EventId]) REFERENCES [Events] ([EventId]) ON DELETE CASCADE,
        CONSTRAINT [FK_EventNeeds_Members_ResponsibleMemberId] FOREIGN KEY ([ResponsibleMemberId]) REFERENCES [Members] ([MemberId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Givings] (
        [GivingId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [MemberId] int NULL,
        [ChurchServiceId] int NULL,
        [GivingType] nvarchar(50) NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [GivingDate] datetime2 NOT NULL,
        [PaymentMethod] nvarchar(50) NOT NULL,
        [ReferenceNumber] nvarchar(100) NOT NULL,
        [Notes] nvarchar(500) NOT NULL,
        [RecordedBy] nvarchar(100) NOT NULL,
        [RecordedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Givings] PRIMARY KEY ([GivingId]),
        CONSTRAINT [FK_Givings_ChurchServices_ChurchServiceId] FOREIGN KEY ([ChurchServiceId]) REFERENCES [ChurchServices] ([ChurchServiceId]) ON DELETE SET NULL,
        CONSTRAINT [FK_Givings_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Givings_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Users] (
        [UserId] int NOT NULL IDENTITY,
        [Username] nvarchar(100) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [FullName] nvarchar(150) NOT NULL,
        [RoleId] int NOT NULL,
        [MemberId] int NULL,
        [CustomerId] int NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [ApprovalStatus] nvarchar(50) NOT NULL DEFAULT N'APPROVED',
        [AccountType] nvarchar(30) NOT NULL,
        [Email] nvarchar(200) NULL,
        [LastLoginDate] datetime2 NULL,
        [PasswordChangedDate] datetime2 NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([UserId]),
        CONSTRAINT [FK_Users_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Users_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([RoleId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Visitors] (
        [VisitorId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [VisitorCode] nvarchar(50) NOT NULL,
        [FirstName] nvarchar(100) NOT NULL,
        [MiddleName] nvarchar(100) NOT NULL,
        [LastName] nvarchar(100) NOT NULL,
        [Gender] nvarchar(20) NOT NULL,
        [BirthDate] datetime2 NULL,
        [ContactNumber] nvarchar(50) NOT NULL,
        [Address] nvarchar(250) NOT NULL,
        [Email] nvarchar(200) NULL,
        [InvitedBy] nvarchar(100) NOT NULL,
        [Ministry] nvarchar(100) NOT NULL,
        [Status] nvarchar(50) NOT NULL,
        [FirstVisitDate] datetime2 NULL,
        [VisitCount] int NOT NULL,
        [FollowUpStatus] nvarchar(50) NOT NULL,
        [IsConvertedToMember] bit NOT NULL,
        [ConvertedMemberId] int NULL,
        [ConversionDate] datetime2 NULL,
        [Notes] nvarchar(500) NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_Visitors] PRIMARY KEY ([VisitorId]),
        CONSTRAINT [FK_Visitors_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE CASCADE,
        CONSTRAINT [FK_Visitors_Members_ConvertedMemberId] FOREIGN KEY ([ConvertedMemberId]) REFERENCES [Members] ([MemberId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [MinistryMembers] (
        [MinistryMemberId] int NOT NULL IDENTITY,
        [MinistryId] int NOT NULL,
        [MemberId] int NOT NULL,
        [Role] nvarchar(100) NULL,
        [Position] nvarchar(100) NULL,
        [Status] nvarchar(50) NOT NULL DEFAULT N'ACTIVE',
        [Notes] nvarchar(500) NULL,
        [DateAssigned] datetime2 NOT NULL,
        [DateEnded] datetime2 NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_MinistryMembers] PRIMARY KEY ([MinistryMemberId]),
        CONSTRAINT [FK_MinistryMembers_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MinistryMembers_Ministries_MinistryId] FOREIGN KEY ([MinistryId]) REFERENCES [Ministries] ([MinistryId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Payments] (
        [PaymentId] int NOT NULL IDENTITY,
        [SubscriptionId] int NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Currency] nvarchar(10) NOT NULL DEFAULT N'PHP',
        [PaymentMethod] nvarchar(50) NOT NULL DEFAULT N'Manual',
        [Status] nvarchar(30) NOT NULL DEFAULT N'PENDING',
        [ReferenceNumber] nvarchar(200) NULL,
        [GatewayPaymentId] nvarchar(200) NULL,
        [GatewayCheckoutId] nvarchar(200) NULL,
        [GatewayCustomerId] nvarchar(200) NULL,
        [PaidDate] datetime2 NULL,
        [FailedDate] datetime2 NULL,
        [BillingPeriodStart] datetime2 NULL,
        [BillingPeriodEnd] datetime2 NULL,
        [InvoiceNumber] nvarchar(100) NULL,
        [ReceiptNumber] nvarchar(100) NULL,
        [FailureReason] nvarchar(1000) NULL,
        [Notes] nvarchar(2000) NULL,
        [PaymentProofFileName] nvarchar(255) NULL,
        [PaymentProofContentType] nvarchar(100) NULL,
        [PaymentProofData] varbinary(max) NULL,
        [PaymentProofUploadedDate] datetime2 NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_Payments] PRIMARY KEY ([PaymentId]),
        CONSTRAINT [FK_Payments_Subscriptions_SubscriptionId] FOREIGN KEY ([SubscriptionId]) REFERENCES [Subscriptions] ([SubscriptionId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [EventRoles] (
        [EventRoleId] int NOT NULL IDENTITY,
        [EventDepartmentId] int NOT NULL,
        [RoleName] nvarchar(150) NOT NULL,
        [RoleDescription] nvarchar(500) NULL,
        [Priority] nvarchar(20) NOT NULL DEFAULT N'NORMAL',
        [Status] nvarchar(30) NOT NULL DEFAULT N'ACTIVE',
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_EventRoles] PRIMARY KEY ([EventRoleId]),
        CONSTRAINT [FK_EventRoles_EventDepartments_EventDepartmentId] FOREIGN KEY ([EventDepartmentId]) REFERENCES [EventDepartments] ([EventDepartmentId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [Certificates] (
        [CertificateId] int NOT NULL IDENTITY,
        [CourseId] int NOT NULL,
        [UserId] int NOT NULL,
        [CertificateNumber] nvarchar(100) NOT NULL,
        [RecipientName] nvarchar(200) NOT NULL,
        [CourseTitle] nvarchar(200) NOT NULL,
        [IssuedDate] datetime2 NOT NULL,
        [CertificateUrl] nvarchar(500) NULL,
        CONSTRAINT [PK_Certificates] PRIMARY KEY ([CertificateId]),
        CONSTRAINT [FK_Certificates_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([CourseId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Certificates_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [CourseEnrollments] (
        [CourseEnrollmentId] int NOT NULL IDENTITY,
        [CourseId] int NOT NULL,
        [UserId] int NOT NULL,
        [EnrolledDate] datetime2 NOT NULL,
        [CompletedDate] datetime2 NULL,
        [IsCompleted] bit NOT NULL,
        [ProgressPercentage] int NOT NULL DEFAULT 0,
        CONSTRAINT [PK_CourseEnrollments] PRIMARY KEY ([CourseEnrollmentId]),
        CONSTRAINT [FK_CourseEnrollments_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([CourseId]) ON DELETE CASCADE,
        CONSTRAINT [FK_CourseEnrollments_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [VisitorAttendances] (
        [VisitorAttendanceId] int NOT NULL IDENTITY,
        [VisitorId] int NOT NULL,
        [ChurchServiceId] int NOT NULL,
        [AttendanceDate] datetime2 NOT NULL,
        [Status] nvarchar(50) NOT NULL DEFAULT N'PRESENT',
        [RecordedBy] nvarchar(100) NOT NULL,
        [RecordedDate] datetime2 NOT NULL,
        CONSTRAINT [PK_VisitorAttendances] PRIMARY KEY ([VisitorAttendanceId]),
        CONSTRAINT [FK_VisitorAttendances_ChurchServices_ChurchServiceId] FOREIGN KEY ([ChurchServiceId]) REFERENCES [ChurchServices] ([ChurchServiceId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_VisitorAttendances_Visitors_VisitorId] FOREIGN KEY ([VisitorId]) REFERENCES [Visitors] ([VisitorId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [MinistryPerformanceRatings] (
        [PerformanceRatingId] int NOT NULL IDENTITY,
        [MinistryMemberId] int NOT NULL,
        [EvaluationDate] datetime2 NOT NULL,
        [AttendanceRating] decimal(3,2) NOT NULL,
        [CommitmentRating] decimal(3,2) NOT NULL,
        [ParticipationRating] decimal(3,2) NOT NULL,
        [TeamworkRating] decimal(3,2) NOT NULL,
        [SpiritualGrowthRating] decimal(3,2) NOT NULL,
        [LeadershipRating] decimal(3,2) NOT NULL,
        [ResponsibilityRating] decimal(3,2) NOT NULL,
        [OverallRating] decimal(3,2) NOT NULL,
        [Strengths] nvarchar(2000) NOT NULL,
        [AreasForImprovement] nvarchar(2000) NOT NULL,
        [Recommendations] nvarchar(2000) NOT NULL,
        [Evaluator] nvarchar(200) NOT NULL,
        [Notes] nvarchar(2000) NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NULL,
        CONSTRAINT [PK_MinistryPerformanceRatings] PRIMARY KEY ([PerformanceRatingId]),
        CONSTRAINT [FK_MinistryPerformanceRatings_MinistryMembers_MinistryMemberId] FOREIGN KEY ([MinistryMemberId]) REFERENCES [MinistryMembers] ([MinistryMemberId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [EventAssignments] (
        [EventAssignmentId] int NOT NULL IDENTITY,
        [EventId] int NOT NULL,
        [EventDepartmentId] int NULL,
        [EventRoleId] int NULL,
        [MemberId] int NULL,
        [AssignedPerson] nvarchar(200) NULL,
        [DepartmentName] nvarchar(150) NULL,
        [RoleName] nvarchar(150) NULL,
        [AssignmentStatus] nvarchar(50) NOT NULL DEFAULT N'PENDING',
        [Priority] nvarchar(50) NOT NULL DEFAULT N'NORMAL',
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_EventAssignments] PRIMARY KEY ([EventAssignmentId]),
        CONSTRAINT [FK_EventAssignments_EventDepartments_EventDepartmentId] FOREIGN KEY ([EventDepartmentId]) REFERENCES [EventDepartments] ([EventDepartmentId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_EventAssignments_EventRoles_EventRoleId] FOREIGN KEY ([EventRoleId]) REFERENCES [EventRoles] ([EventRoleId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_EventAssignments_Events_EventId] FOREIGN KEY ([EventId]) REFERENCES [Events] ([EventId]) ON DELETE CASCADE,
        CONSTRAINT [FK_EventAssignments_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([MemberId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE TABLE [LessonProgresses] (
        [LessonProgressId] int NOT NULL IDENTITY,
        [CourseEnrollmentId] int NOT NULL,
        [LessonId] int NOT NULL,
        [IsCompleted] bit NOT NULL,
        [ProgressPercentage] int NOT NULL DEFAULT 0,
        [StartedDate] datetime2 NULL,
        [CompletedDate] datetime2 NULL,
        CONSTRAINT [PK_LessonProgresses] PRIMARY KEY ([LessonProgressId]),
        CONSTRAINT [FK_LessonProgresses_CourseEnrollments_CourseEnrollmentId] FOREIGN KEY ([CourseEnrollmentId]) REFERENCES [CourseEnrollments] ([CourseEnrollmentId]) ON DELETE CASCADE,
        CONSTRAINT [FK_LessonProgresses_Lessons_LessonId] FOREIGN KEY ([LessonId]) REFERENCES [Lessons] ([LessonId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Attendances_ChurchServiceId] ON [Attendances] ([ChurchServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Attendances_EventId] ON [Attendances] ([EventId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Attendances_MemberId_ChurchServiceId] ON [Attendances] ([MemberId], [ChurchServiceId]) WHERE [ChurchServiceId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Attendances_MemberId_EventId] ON [Attendances] ([MemberId], [EventId]) WHERE [EventId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Certificates_CertificateNumber] ON [Certificates] ([CertificateNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Certificates_CourseId] ON [Certificates] ([CourseId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Certificates_UserId] ON [Certificates] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_ChurchServices_CustomerId] ON [ChurchServices] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_ChurchServices_CustomerId_ServiceDate] ON [ChurchServices] ([CustomerId], [ServiceDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_ChurchServices_ServiceDate] ON [ChurchServices] ([ServiceDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_ChurchServices_ServiceType] ON [ChurchServices] ([ServiceType]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_ChurchServices_Status] ON [ChurchServices] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_ClientMembers_ClientRoleId] ON [ClientMembers] ([ClientRoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_ClientMembers_CustomerId] ON [ClientMembers] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ClientMembers_CustomerId_MemberId] ON [ClientMembers] ([CustomerId], [MemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_ClientMembers_MemberId] ON [ClientMembers] ([MemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ClientPermissions_ClientRoleId_ModuleName] ON [ClientPermissions] ([ClientRoleId], [ModuleName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_ClientRoles_CustomerId] ON [ClientRoles] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ClientRoles_CustomerId_RoleName] ON [ClientRoles] ([CustomerId], [RoleName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_CourseEnrollments_CourseId_UserId] ON [CourseEnrollments] ([CourseId], [UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_CourseEnrollments_UserId] ON [CourseEnrollments] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_CourseModules_CourseId] ON [CourseModules] ([CourseId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_CRBreakPasses_MemberId] ON [CRBreakPasses] ([MemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Customers_CreatedDate] ON [Customers] ([CreatedDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Customers_DemoRequestId] ON [Customers] ([DemoRequestId]) WHERE [DemoRequestId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Customers_Email] ON [Customers] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Customers_Status] ON [Customers] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_DemoRequests_CreatedDate] ON [DemoRequests] ([CreatedDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_DemoRequests_Status] ON [DemoRequests] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventAssignments_AssignmentStatus] ON [EventAssignments] ([AssignmentStatus]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventAssignments_EventDepartmentId] ON [EventAssignments] ([EventDepartmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventAssignments_EventId] ON [EventAssignments] ([EventId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventAssignments_EventRoleId] ON [EventAssignments] ([EventRoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventAssignments_MemberId] ON [EventAssignments] ([MemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventAssignments_Priority] ON [EventAssignments] ([Priority]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventChecklists_AssignedMemberId] ON [EventChecklists] ([AssignedMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventChecklists_Category] ON [EventChecklists] ([Category]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventChecklists_CompletedByMemberId] ON [EventChecklists] ([CompletedByMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventChecklists_DueDate] ON [EventChecklists] ([DueDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventChecklists_EventId] ON [EventChecklists] ([EventId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventChecklists_Priority] ON [EventChecklists] ([Priority]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventChecklists_SortOrder] ON [EventChecklists] ([SortOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventChecklists_Status] ON [EventChecklists] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventDepartments_DepartmentHeadMemberId] ON [EventDepartments] ([DepartmentHeadMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventDepartments_EventId] ON [EventDepartments] ([EventId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_EventDepartments_EventId_DepartmentName] ON [EventDepartments] ([EventId], [DepartmentName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventDepartments_Priority] ON [EventDepartments] ([Priority]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventDepartments_Status] ON [EventDepartments] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventNeeds_Category] ON [EventNeeds] ([Category]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventNeeds_EventId] ON [EventNeeds] ([EventId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventNeeds_NeededBy] ON [EventNeeds] ([NeededBy]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventNeeds_Priority] ON [EventNeeds] ([Priority]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventNeeds_ResponsibleMemberId] ON [EventNeeds] ([ResponsibleMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventNeeds_Status] ON [EventNeeds] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventRoles_EventDepartmentId] ON [EventRoles] ([EventDepartmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_EventRoles_EventDepartmentId_RoleName] ON [EventRoles] ([EventDepartmentId], [RoleName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventRoles_Priority] ON [EventRoles] ([Priority]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventRoles_RoleName] ON [EventRoles] ([RoleName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_EventRoles_Status] ON [EventRoles] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Events_CustomerId] ON [Events] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Events_CustomerId_EventDate] ON [Events] ([CustomerId], [EventDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Events_EventDate] ON [Events] ([EventDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Events_EventType] ON [Events] ([EventType]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Events_Status] ON [Events] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Expenses_Category] ON [Expenses] ([Category]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Expenses_CustomerId] ON [Expenses] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Expenses_CustomerId_ExpenseDate] ON [Expenses] ([CustomerId], [ExpenseDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Expenses_ExpenseDate] ON [Expenses] ([ExpenseDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Expenses_PaymentMethod] ON [Expenses] ([PaymentMethod]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Givings_ChurchServiceId] ON [Givings] ([ChurchServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Givings_CustomerId] ON [Givings] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Givings_GivingDate] ON [Givings] ([GivingDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Givings_GivingType] ON [Givings] ([GivingType]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Givings_MemberId] ON [Givings] ([MemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Givings_PaymentMethod] ON [Givings] ([PaymentMethod]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Incomes_Category] ON [Incomes] ([Category]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Incomes_CustomerId] ON [Incomes] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Incomes_CustomerId_IncomeDate] ON [Incomes] ([CustomerId], [IncomeDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Incomes_IncomeDate] ON [Incomes] ([IncomeDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Incomes_PaymentMethod] ON [Incomes] ([PaymentMethod]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_LessonProgresses_CourseEnrollmentId_LessonId] ON [LessonProgresses] ([CourseEnrollmentId], [LessonId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_LessonProgresses_LessonId] ON [LessonProgresses] ([LessonId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Lessons_CourseModuleId] ON [Lessons] ([CourseModuleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Members_CustomerId] ON [Members] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Members_CustomerId_MemberCode] ON [Members] ([CustomerId], [MemberCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Ministries_CustomerId] ON [Ministries] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Ministries_CustomerId_Name] ON [Ministries] ([CustomerId], [Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_MinistryMembers_MemberId] ON [MinistryMembers] ([MemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_MinistryMembers_MinistryId] ON [MinistryMembers] ([MinistryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_MinistryMembers_MinistryId_MemberId] ON [MinistryMembers] ([MinistryId], [MemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_MinistryMembers_Status] ON [MinistryMembers] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_MinistryPerformanceRatings_MinistryMemberId] ON [MinistryPerformanceRatings] ([MinistryMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Payments_CreatedDate] ON [Payments] ([CreatedDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Payments_GatewayPaymentId] ON [Payments] ([GatewayPaymentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Payments_ReferenceNumber] ON [Payments] ([ReferenceNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Payments_Status] ON [Payments] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Payments_SubscriptionId] ON [Payments] ([SubscriptionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Permissions_RoleId_Module] ON [Permissions] ([RoleId], [Module]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_RoleName] ON [Roles] ([RoleName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Subscriptions_ContactEmail] ON [Subscriptions] ([ContactEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Subscriptions_CreatedDate] ON [Subscriptions] ([CreatedDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Subscriptions_CustomerId] ON [Subscriptions] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Subscriptions_Status] ON [Subscriptions] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Subscriptions_SubscriptionPlanId] ON [Subscriptions] ([SubscriptionPlanId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Users_ApprovalStatus] ON [Users] ([ApprovalStatus]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Users_CustomerId] ON [Users] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Users_IsActive] ON [Users] ([IsActive]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Users_MemberId] ON [Users] ([MemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_VisitorAttendances_AttendanceDate] ON [VisitorAttendances] ([AttendanceDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_VisitorAttendances_ChurchServiceId] ON [VisitorAttendances] ([ChurchServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_VisitorAttendances_Status] ON [VisitorAttendances] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_VisitorAttendances_VisitorId] ON [VisitorAttendances] ([VisitorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_VisitorAttendances_VisitorId_ChurchServiceId] ON [VisitorAttendances] ([VisitorId], [ChurchServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Visitors_ConvertedMemberId] ON [Visitors] ([ConvertedMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_Visitors_CustomerId] ON [Visitors] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Visitors_VisitorCode] ON [Visitors] ([VisitorCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_WebsiteVisits_Country] ON [WebsiteVisits] ([Country]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_WebsiteVisits_DeviceType] ON [WebsiteVisits] ([DeviceType]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_WebsiteVisits_PagePath] ON [WebsiteVisits] ([PagePath]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_WebsiteVisits_SessionId] ON [WebsiteVisits] ([SessionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_WebsiteVisits_TrafficMedium] ON [WebsiteVisits] ([TrafficMedium]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_WebsiteVisits_TrafficSource] ON [WebsiteVisits] ([TrafficSource]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_WebsiteVisits_UtmCampaign] ON [WebsiteVisits] ([UtmCampaign]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_WebsiteVisits_VisitedAt] ON [WebsiteVisits] ([VisitedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    CREATE INDEX [IX_WebsiteVisits_VisitorId] ON [WebsiteVisits] ([VisitorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260904033316_InitialSchoolSystem'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260904033316_InitialSchoolSystem', N'10.0.10');
END;

COMMIT;
GO

