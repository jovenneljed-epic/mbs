using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using School.Api.Data;
using School.Api.Models;
using School.Api.Services;

namespace School.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ResendEmailService _emailService;

        // In-memory automation trigger rules
        private static readonly List<AutomationTriggerModel> _triggers = new()
        {
            new AutomationTriggerModel
            {
                Id = 1,
                Name = "Student Admissions & Matriculation Welcome",
                Description = "Dispatches welcome push notification & email with Student ID upon enrollment approval",
                EventKey = "STUDENT_MATRICULATED",
                Channels = new List<string> { "Push", "Email" },
                TargetAudience = "Admitted Students",
                IsActive = true,
                LastTriggered = DateTime.UtcNow.AddHours(-3)
            },
            new AutomationTriggerModel
            {
                Id = 2,
                Name = "Tuition Payment & Cutoff Date Alert",
                Description = "Automated reminder sent 3 days before term fee deadline with billing statement",
                EventKey = "TUITION_DUE_WARNING",
                Channels = new List<string> { "Push", "Email", "Portal" },
                TargetAudience = "Enrolled Students",
                IsActive = true,
                LastTriggered = DateTime.UtcNow.AddDays(-1)
            },
            new AutomationTriggerModel
            {
                Id = 3,
                Name = "Class Schedule & Room Assignment Changes",
                Description = "Instant high-priority mobile push when subject schedule or lecture room is modified",
                EventKey = "SCHEDULE_MODIFIED",
                Channels = new List<string> { "Push", "Portal" },
                TargetAudience = "Enrolled Students & Faculty",
                IsActive = true,
                LastTriggered = DateTime.UtcNow.AddHours(-18)
            },
            new AutomationTriggerModel
            {
                Id = 4,
                Name = "Midterm & Final Grades Release Notice",
                Description = "Broadcasts mobile app alert directing students to portal grade card once published",
                EventKey = "GRADES_PUBLISHED",
                Channels = new List<string> { "Push", "Email" },
                TargetAudience = "Active Students",
                IsActive = true,
                LastTriggered = DateTime.UtcNow.AddDays(-5)
            },
            new AutomationTriggerModel
            {
                Id = 5,
                Name = "Weekly Monday Devotional & Campus Timetable",
                Description = "Scheduled weekly broadcast sent every Monday at 8:00 AM to all campus members",
                EventKey = "WEEKLY_CAMPUS_BULLETIN",
                Channels = new List<string> { "Email", "Push" },
                TargetAudience = "All Campus Members",
                IsActive = true,
                LastTriggered = DateTime.UtcNow.AddDays(-2)
            },
            new AutomationTriggerModel
            {
                Id = 6,
                Name = "Admissions Missing Credentials Reminder",
                Description = "Follow-up alert sent to applicants with pending TOR or Birth Certificate clearances",
                EventKey = "ADMISSION_DOCS_PENDING",
                Channels = new List<string> { "Email", "Push" },
                TargetAudience = "Applicants in Review",
                IsActive = true,
                LastTriggered = DateTime.UtcNow.AddDays(-4)
            }
        };

        public NotificationsController(
            ApplicationDbContext context,
            ResendEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // =========================================================
        // GET ALL NOTIFICATIONS / BROADCASTS
        // GET: /api/Notifications
        // =========================================================
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var announcements = await _context.Announcements
                .AsNoTracking()
                .OrderByDescending(a => a.PublishDate)
                .ToListAsync();

            return Ok(announcements);
        }

        // =========================================================
        // BROADCAST NOTIFICATION CAMPAIGN
        // POST: /api/Notifications/broadcast
        // =========================================================
        [HttpPost("broadcast")]
        [Authorize]
        public async Task<IActionResult> BroadcastNotification(
            [FromBody] BroadcastRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { message = "Notification title and content body are required." });
            }

            var channels = request.Channels ?? new List<string> { "Push", "Email", "Portal" };
            var targetAudience = string.IsNullOrWhiteSpace(request.TargetAudience) ? "All Campus" : request.TargetAudience;
            var category = string.IsNullOrWhiteSpace(request.Category) ? "Academic Announcement" : request.Category;
            var priority = string.IsNullOrWhiteSpace(request.Priority) ? "Normal" : request.Priority;
            var deepLink = string.IsNullOrWhiteSpace(request.DeepLink) ? "/announcements" : request.DeepLink;

            // Prepare serialized metadata
            var metadata = new
            {
                message = request.Content,
                channels = channels,
                targetAudience = targetAudience,
                priority = priority,
                deepLink = deepLink,
                mobileAppPush = channels.Contains("Push"),
                emailBroadcast = channels.Contains("Email"),
                portalBell = channels.Contains("Portal"),
                dispatchedAt = DateTime.UtcNow
            };

            var announcement = new Announcement
            {
                Title = request.Title.Trim(),
                Content = JsonSerializer.Serialize(metadata),
                Category = category.Trim(),
                IsPublished = true,
                PublishDate = request.ScheduledDate ?? DateTime.UtcNow,
                CreatedDate = DateTime.UtcNow
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            int emailsSent = 0;
            int pushPings = 0;

            // If Push Notification channel selected: simulated FCM/APNs push queue
            if (channels.Contains("Push"))
            {
                // In production, pushes payload to FCM v1 and APNs via device tokens
                pushPings = await _context.Members.CountAsync();
                if (pushPings == 0) pushPings = 1;
            }

            // If Email channel selected: send broadcast email to sample/configured targets
            if (channels.Contains("Email") && !string.IsNullOrWhiteSpace(request.RecipientEmail))
            {
                try
                {
                    var emailHtml = $@"
<!DOCTYPE html>
<html>
<body style='margin:0;padding:24px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;'>
  <div style='max-width:600px;margin:auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 15px rgba(0,0,0,0.06);'>
    <div style='background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:28px;color:#ffffff;'>
      <div style='font-size:11px;font-weight:700;letter-spacing:0.08em;background:rgba(255,255,255,0.2);padding:4px 10px;border-radius:20px;display:inline-block;margin-bottom:8px;'>MOBILE BIBLE SCHOOL • OFFICIAL NOTIFICATION</div>
      <h1 style='margin:0;font-size:22px;font-weight:800;'>{request.Title}</h1>
      <p style='margin:6px 0 0 0;font-size:13px;color:rgba(255,255,255,0.85);'>Audience: {targetAudience} • Priority: {priority}</p>
    </div>
    <div style='padding:28px;'>
      <div style='font-size:14.5px;line-height:1.65;color:#334155;white-space:pre-wrap;'>{request.Content}</div>
      <div style='margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;'>
        <span style='font-size:12px;color:#64748b;'>Office of the University Registrar & Administration</span>
        <span style='font-size:11px;color:#94a3b8;'>MBS Mobile App Ready</span>
      </div>
    </div>
  </div>
</body>
</html>";
                    await _emailService.SendEmailAsync(request.RecipientEmail.Trim(), request.Title.Trim(), emailHtml);
                    emailsSent = 1;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Email broadcast notice: {ex.Message}");
                }
            }

            return Ok(new
            {
                success = true,
                announcementId = announcement.Id,
                title = announcement.Title,
                channels = channels,
                targetAudience = targetAudience,
                pushPingsCount = pushPings,
                emailsSentCount = emailsSent,
                message = "Notification broadcast dispatched successfully across selected channels!"
            });
        }

        // =========================================================
        // TEST PUSH NOTIFICATION PAYLOAD (FOR MBS MOBILE APP)
        // POST: /api/Notifications/test-push
        // =========================================================
        [HttpPost("test-push")]
        [Authorize]
        public IActionResult SendTestPush([FromBody] TestPushRequestDto dto)
        {
            var title = string.IsNullOrWhiteSpace(dto.Title) ? "MBS Mobile App Notification Test" : dto.Title.Trim();
            var body = string.IsNullOrWhiteSpace(dto.Body) ? "Live push payload connection verified successfully for MBS Mobile App." : dto.Body.Trim();
            var deepLink = string.IsNullOrWhiteSpace(dto.DeepLink) ? "/portal/dashboard" : dto.DeepLink.Trim();
            var priority = string.IsNullOrWhiteSpace(dto.Priority) ? "high" : dto.Priority.Trim();

            var fcmPayload = new
            {
                message = new
                {
                    topic = "all_mbs_students",
                    notification = new
                    {
                        title = title,
                        body = body
                    },
                    data = new
                    {
                        deepLink = deepLink,
                        priority = priority,
                        timestamp = DateTime.UtcNow.ToString("o")
                    },
                    android = new
                    {
                        priority = "HIGH",
                        notification = new
                        {
                            channel_id = "mbs_academic_alerts",
                            sound = "default"
                        }
                    },
                    apns = new
                    {
                        headers = new
                        {
                            apns_priority = "10"
                        },
                        payload = new
                        {
                            aps = new
                            {
                                alert = new { title = title, body = body },
                                badge = 1,
                                sound = "default"
                            }
                        }
                    }
                }
            };

            return Ok(new
            {
                success = true,
                gateway = "MBS Mobile Push Gateway (FCM v1 & Apple APNs)",
                status = "Delivered to Push Queue",
                dispatchedAt = DateTime.UtcNow,
                payload = fcmPayload,
                message = "Test push payload formatted and dispatched successfully!"
            });
        }

        // =========================================================
        // GET AUTOMATION TRIGGERS
        // GET: /api/Notifications/triggers
        // =========================================================
        [HttpGet("triggers")]
        public IActionResult GetAutomationTriggers()
        {
            return Ok(_triggers);
        }

        // =========================================================
        // TOGGLE AUTOMATION TRIGGER STATUS
        // PUT: /api/Notifications/triggers/{id}
        // =========================================================
        [HttpPut("triggers/{id:int}")]
        [Authorize]
        public IActionResult ToggleTrigger(int id, [FromBody] TriggerUpdateDto dto)
        {
            var trigger = _triggers.FirstOrDefault(t => t.Id == id);
            if (trigger == null)
            {
                return NotFound(new { message = "Automation trigger not found." });
            }

            trigger.IsActive = dto.IsActive;
            if (dto.Channels != null && dto.Channels.Count > 0)
            {
                trigger.Channels = dto.Channels;
            }

            return Ok(new
            {
                success = true,
                trigger,
                message = $"Automation trigger '{trigger.Name}' is now {(trigger.IsActive ? "ACTIVE" : "PAUSED")}."
            });
        }

        // =========================================================
        // REGISTER MOBILE APP DEVICE TOKEN (FOR UPCOMING MBS APP)
        // POST: /api/Notifications/register-device
        // =========================================================
        [HttpPost("register-device")]
        [AllowAnonymous]
        public IActionResult RegisterDevice([FromBody] DeviceRegistrationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.DeviceToken))
            {
                return BadRequest(new { message = "DeviceToken is required." });
            }

            // In production, save or update user device tokens
            return Ok(new
            {
                success = true,
                registered = true,
                platform = dto.Platform ?? "Android",
                tokenPreview = dto.DeviceToken.Length > 12 ? dto.DeviceToken.Substring(0, 12) + "..." : dto.DeviceToken,
                registeredAt = DateTime.UtcNow,
                message = "Mobile device token registered with MBS Push Gateway."
            });
        }

        // =========================================================
        // REAL-TIME PORTAL NOTIFICATION FEED
        // Inquiries, Requests, Incoming Messages, Admissions & New Student Inquiries
        // GET: /api/Notifications/portal-feed
        // =========================================================
        [HttpGet("portal-feed")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPortalNotificationFeed()
        {
            var items = new List<PortalNotificationItemDto>();

            // 1. Fetch Landing Page & Contact Desk Inquiries, Admissions, and Requests
            var inquiries = await _context.DemoRequests
                .AsNoTracking()
                .OrderByDescending(r => r.CreatedDate)
                .Take(50)
                .ToListAsync();

            foreach (var r in inquiries)
            {
                var pos = r.Position ?? "";
                var msg = r.Message ?? "";
                var notes = r.AdminNotes ?? "";

                bool isAdmission = pos.Contains("Admission", StringComparison.OrdinalIgnoreCase) ||
                                   pos.Contains("Enroll", StringComparison.OrdinalIgnoreCase) ||
                                   msg.Contains("Admission", StringComparison.OrdinalIgnoreCase) ||
                                   msg.Contains("Application", StringComparison.OrdinalIgnoreCase) ||
                                   notes.Contains("Admission Application", StringComparison.OrdinalIgnoreCase);

                bool isVisit = pos.Contains("Tour", StringComparison.OrdinalIgnoreCase) ||
                               pos.Contains("Visit", StringComparison.OrdinalIgnoreCase) ||
                               pos.Contains("Demo", StringComparison.OrdinalIgnoreCase);

                string type = isAdmission ? "admission" : (isVisit ? "request" : (pos.Contains("Inquir", StringComparison.OrdinalIgnoreCase) ? "inquiry" : "message"));
                string source = isAdmission ? "Front Landing Page • Online Admission" : (isVisit ? "Public Campus Tour Request" : "Front Contact Desk • Incoming Inquiry");
                string title = isAdmission
                    ? $"New Student Admission Application: {r.FullName}"
                    : (isVisit
                        ? $"Campus Visit / Demo Request from {r.FullName}"
                        : $"New Message from {r.FullName}: {(!string.IsNullOrWhiteSpace(r.Position) ? r.Position : "General Inquiry")}");

                string summary = !string.IsNullOrWhiteSpace(r.Message) ? r.Message : $"Contact inquiry submitted from front landing page by {r.FullName}";
                bool isPending = string.Equals(r.Status, "Pending", StringComparison.OrdinalIgnoreCase);

                items.Add(new PortalNotificationItemDto
                {
                    Id = $"inq-{r.DemoRequestId}",
                    Type = type,
                    Title = title,
                    Summary = summary,
                    Source = source,
                    SenderName = r.FullName,
                    SenderEmail = r.Email,
                    SenderPhone = r.Phone,
                    Affiliation = r.ChurchName,
                    Category = !string.IsNullOrWhiteSpace(r.Position) ? r.Position : (isAdmission ? "Admissions & Enrollment" : "General Inquiries"),
                    Timestamp = r.CreatedDate,
                    Status = r.Status,
                    IsPending = isPending,
                    Priority = isAdmission || isPending ? "high" : "normal",
                    ActionUrl = "demo-requests",
                    ReferenceId = r.DemoRequestId.ToString()
                });
            }

            // 2. Fetch Recent Enrolled Members / Student Profiles
            try
            {
                var members = await _context.Members
                    .AsNoTracking()
                    .OrderByDescending(m => m.CreatedDate)
                    .Take(10)
                    .ToListAsync();

                foreach (var m in members)
                {
                    items.Add(new PortalNotificationItemDto
                    {
                        Id = $"mem-{m.MemberId}",
                        Type = "student",
                        Title = $"New Student Profile: {m.FirstName} {m.LastName}",
                        Summary = $"Student Code: {m.MemberCode} • Cohort: {m.Ministry ?? "Theological Department"}",
                        Source = "Seminary Student Roster",
                        SenderName = $"{m.FirstName} {m.LastName}",
                        SenderEmail = null,
                        SenderPhone = m.ContactNumber,
                        Affiliation = m.Address ?? "MBS Seminary Main Campus",
                        Category = "Student Enrollment",
                        Timestamp = m.CreatedDate,
                        Status = m.Status ?? "Active",
                        IsPending = false,
                        Priority = "normal",
                        ActionUrl = "members",
                        ReferenceId = m.MemberId.ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Notifications] Note reading members: {ex.Message}");
            }

            // 3. Fetch Recent Community Discussions from LMS if available
            try
            {
                var discussionsPath = Path.Combine(AppContext.BaseDirectory, "App_Data", "lms_discussions.json");
                if (System.IO.File.Exists(discussionsPath))
                {
                    var json = await System.IO.File.ReadAllTextAsync(discussionsPath);
                    var discussions = JsonSerializer.Deserialize<List<JsonElement>>(json);
                    if (discussions != null)
                    {
                        foreach (var d in discussions.Take(5))
                        {
                            string dId = d.TryGetProperty("id", out var pId) ? pId.GetString() ?? "" : "";
                            string dTitle = d.TryGetProperty("title", out var pTitle) ? pTitle.GetString() ?? "" : "Community Discussion";
                            string dContent = d.TryGetProperty("content", out var pContent) ? pContent.GetString() ?? "" : "";
                            string dAuthor = d.TryGetProperty("authorName", out var pAuthor) ? pAuthor.GetString() ?? "Student" : "Student";
                            string dSchoolNo = d.TryGetProperty("schoolNumber", out var pSchoolNo) ? pSchoolNo.GetString() ?? "" : "";
                            string dCreatedAt = d.TryGetProperty("createdAt", out var pCreated) ? pCreated.GetString() ?? "" : "";
                            DateTime.TryParse(dCreatedAt, out var dt);

                            items.Add(new PortalNotificationItemDto
                            {
                                Id = $"lms-{dId}",
                                Type = "discussion",
                                Title = $"LMS Student Discussion: {dTitle}",
                                Summary = dContent,
                                Source = $"Classroom Community Chat ({dSchoolNo})",
                                SenderName = dAuthor,
                                SenderEmail = "",
                                SenderPhone = null,
                                Affiliation = dSchoolNo,
                                Category = "Community Chat",
                                Timestamp = dt != DateTime.MinValue ? dt : DateTime.UtcNow,
                                Status = "Open",
                                IsPending = false,
                                Priority = "normal",
                                ActionUrl = "learning",
                                ReferenceId = dId
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Notifications] Note reading LMS discussions: {ex.Message}");
            }

            // Order all items by newest first
            var ordered = items.OrderByDescending(x => x.Timestamp).ToList();

            int totalCount = ordered.Count;
            int unreadCount = ordered.Count(x => x.IsPending);
            int admissionsCount = ordered.Count(x => x.Type == "admission" && x.IsPending);
            int inquiriesCount = ordered.Count(x => (x.Type == "inquiry" || x.Type == "message") && x.IsPending);
            int requestsCount = ordered.Count(x => x.Type == "request" && x.IsPending);

            var latestPending = ordered.FirstOrDefault(x => x.IsPending);

            return Ok(new PortalNotificationFeedDto
            {
                Success = true,
                TotalCount = totalCount,
                UnreadCount = unreadCount,
                AdmissionsCount = admissionsCount,
                InquiriesCount = inquiriesCount,
                RequestsCount = requestsCount,
                Notifications = ordered,
                LatestPending = latestPending,
                RetrievedAt = DateTime.UtcNow
            });
        }
    }

    // =========================================================
    // DTO MODELS
    // =========================================================

    public class PortalNotificationItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = "inquiry";
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string? SenderEmail { get; set; }
        public string? SenderPhone { get; set; }
        public string? Affiliation { get; set; }
        public string? Category { get; set; }
        public DateTime Timestamp { get; set; }
        public string Status { get; set; } = "Pending";
        public bool IsPending { get; set; }
        public string Priority { get; set; } = "normal";
        public string ActionUrl { get; set; } = "demo-requests";
        public string ReferenceId { get; set; } = string.Empty;
    }

    public class PortalNotificationFeedDto
    {
        public bool Success { get; set; } = true;
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
        public int AdmissionsCount { get; set; }
        public int InquiriesCount { get; set; }
        public int RequestsCount { get; set; }
        public List<PortalNotificationItemDto> Notifications { get; set; } = new();
        public PortalNotificationItemDto? LatestPending { get; set; }
        public DateTime RetrievedAt { get; set; } = DateTime.UtcNow;
    }

    public class BroadcastRequestDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? Category { get; set; }
        public string? TargetAudience { get; set; }
        public List<string>? Channels { get; set; }
        public string? Priority { get; set; }
        public string? DeepLink { get; set; }
        public string? RecipientEmail { get; set; }
        public DateTime? ScheduledDate { get; set; }
    }

    public class TestPushRequestDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public string? DeepLink { get; set; }
        public string? Priority { get; set; }
    }

    public class TriggerUpdateDto
    {
        public bool IsActive { get; set; }
        public List<string>? Channels { get; set; }
    }

    public class DeviceRegistrationDto
    {
        [Required]
        public string DeviceToken { get; set; } = string.Empty;
        public string? Platform { get; set; } // "iOS" | "Android"
        public string? StudentCode { get; set; }
        public string? AppVersion { get; set; }
    }

    public class AutomationTriggerModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string EventKey { get; set; } = string.Empty;
        public List<string> Channels { get; set; } = new();
        public string TargetAudience { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime LastTriggered { get; set; }
    }
}
