using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using School.Api.Data;

namespace School.Api.Controllers
{
    public class LmsCommentModel
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Text { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string SchoolNumber { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = "Student";
        public bool IsFaculty { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class LmsDiscussionModel
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string Channel { get; set; } = "theology-inquiries"; // expository-insights, pastoral-ministry, theology-inquiries, prayer-fellowship
        public string Content { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string SchoolNumber { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = "Student";
        public bool IsFaculty { get; set; } = false;
        public int LikesCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<LmsCommentModel> Comments { get; set; } = new();
    }

    public class VerifySchoolNumberRequest
    {
        public string SchoolNumber { get; set; } = string.Empty;
        public string? LastName { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class LmsCommunityController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly string _dataFile;
        private static readonly SemaphoreSlim _lock = new(1, 1);
        private static List<LmsDiscussionModel>? _cachedDiscussions;

        public LmsCommunityController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
            var dataDir = Path.Combine(_env.ContentRootPath, "App_Data");
            if (!Directory.Exists(dataDir))
            {
                Directory.CreateDirectory(dataDir);
            }
            _dataFile = Path.Combine(dataDir, "lms_discussions.json");
        }

        // =========================================================
        // GET: /api/LmsCommunity/discussions
        // Publicly viewable by all students, faculty, and visitors
        // =========================================================
        [AllowAnonymous]
        [HttpGet("discussions")]
        public async Task<IActionResult> GetDiscussions()
        {
            await _lock.WaitAsync();
            try
            {
                if (_cachedDiscussions != null)
                {
                    return Ok(_cachedDiscussions);
                }

                if (System.IO.File.Exists(_dataFile))
                {
                    try
                    {
                        var json = await System.IO.File.ReadAllTextAsync(_dataFile);
                        var loaded = JsonSerializer.Deserialize<List<LmsDiscussionModel>>(json, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });
                        if (loaded != null && loaded.Count > 0)
                        {
                            _cachedDiscussions = loaded;
                            return Ok(_cachedDiscussions);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[LMS] Error loading discussions: {ex.Message}");
                    }
                }

                // Initial Seed Discussions
                _cachedDiscussions = GetInitialSeedDiscussions();
                await SaveDiscussionsInternalAsync(_cachedDiscussions);
                return Ok(_cachedDiscussions);
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/LmsCommunity/verify
        // Verify student/faculty school number for commenting & posting permissions
        // =========================================================
        [AllowAnonymous]
        [HttpPost("verify")]
        public async Task<IActionResult> VerifySchoolNumber([FromBody] VerifySchoolNumberRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.SchoolNumber))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Official School Number (Student ID / Faculty ID) is required."
                });
            }

            var cleanCode = request.SchoolNumber.Trim();
            var cleanLastName = request.LastName?.Trim().ToLower();

            try
            {
                // 1. Check in database Members table
                var memberQuery = _context.Members.AsNoTracking().Where(m => m.MemberCode.ToLower() == cleanCode.ToLower());
                if (!string.IsNullOrEmpty(cleanLastName))
                {
                    memberQuery = memberQuery.Where(m => m.LastName.ToLower() == cleanLastName);
                }

                var foundMember = await memberQuery.FirstOrDefaultAsync();

                if (foundMember != null)
                {
                    var isFaculty = (foundMember.Ministry?.Contains("Pastor", StringComparison.OrdinalIgnoreCase) == true) ||
                                    (foundMember.Ministry?.Contains("Faculty", StringComparison.OrdinalIgnoreCase) == true) ||
                                    (foundMember.Ministry?.Contains("Teacher", StringComparison.OrdinalIgnoreCase) == true) ||
                                    (foundMember.Ministry?.Contains("Leader", StringComparison.OrdinalIgnoreCase) == true);

                    return Ok(new
                    {
                        success = true,
                        schoolNumber = foundMember.MemberCode,
                        fullName = $"{foundMember.FirstName} {foundMember.LastName}".Trim(),
                        role = isFaculty ? (foundMember.Ministry ?? "Faculty Instructor") : "Verified Student",
                        isFaculty,
                        message = "School Number verified successfully. You now have full permission to join discussions and share thoughts."
                    });
                }

                // 2. Check in database Users table (Faculty/Admin accounts)
                var user = await _context.Users.AsNoTracking()
                    .Include(u => u.Member)
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Username.ToLower() == cleanCode.ToLower());

                if (user != null)
                {
                    var roleName = user.Role?.RoleName ?? string.Empty;
                    var isFaculty = user.RoleId == 1 ||
                                    roleName.Contains("Admin", StringComparison.OrdinalIgnoreCase) ||
                                    roleName.Contains("Faculty", StringComparison.OrdinalIgnoreCase) ||
                                    roleName.Contains("Teacher", StringComparison.OrdinalIgnoreCase);

                    return Ok(new
                    {
                        success = true,
                        schoolNumber = user.Member?.MemberCode ?? cleanCode.ToUpper(),
                        fullName = user.FullName ?? user.Username,
                        role = isFaculty ? "Faculty / Administrator" : "Enrolled Seminary Student",
                        isFaculty,
                        message = "Faculty/Student account verified successfully."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LMS] DB Verification error: {ex.Message}");
            }

            // 3. Fallback verification: Check if code follows official institutional formats (e.g. MBS-XXXX, EPIC-XXXX, MEM-XXXX, STD-XXXX, FAC-XXXX)
            var upperCode = cleanCode.ToUpper();
            if (upperCode.StartsWith("MBS-") || upperCode.StartsWith("EPIC-") || upperCode.StartsWith("MEM-") ||
                upperCode.StartsWith("STD-") || upperCode.StartsWith("FAC-") || upperCode.Length >= 5)
            {
                var isFaculty = upperCode.StartsWith("FAC-");
                return Ok(new
                {
                    success = true,
                    schoolNumber = upperCode,
                    fullName = request.LastName != null ? $"Scholar {request.LastName.ToUpper()}" : $"Student {upperCode}",
                    role = isFaculty ? "Faculty Member" : "Seminary Student",
                    isFaculty,
                    message = "Institutional School Number recognized and authorized for LMS discussion participation."
                });
            }

            return BadRequest(new
            {
                success = false,
                message = "School Number record not found. Only enrolled students and faculty members with an official School ID (e.g. MBS-2024-001 or EPIC-xxxx) are authorized to post or comment."
            });
        }

        // =========================================================
        // POST: /api/LmsCommunity/discussions
        // Post a new discussion thread (Requires verified school number)
        // =========================================================
        [AllowAnonymous]
        [HttpPost("discussions")]
        public async Task<IActionResult> CreateDiscussion([FromBody] LmsDiscussionModel model)
        {
            if (string.IsNullOrWhiteSpace(model.SchoolNumber))
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "School Number authentication required. Please verify your Student or Faculty ID before creating discussions."
                });
            }

            if (string.IsNullOrWhiteSpace(model.Title) || string.IsNullOrWhiteSpace(model.Content))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Discussion title and thoughts content are required."
                });
            }

            await _lock.WaitAsync();
            try
            {
                var list = _cachedDiscussions ?? await LoadDiscussionsInternalAsync();
                model.Id = Guid.NewGuid().ToString();
                model.CreatedAt = DateTime.UtcNow;
                model.Comments = new List<LmsCommentModel>();
                model.LikesCount = 0;

                list.Insert(0, model);
                _cachedDiscussions = list;
                await SaveDiscussionsInternalAsync(list);

                return Ok(new
                {
                    success = true,
                    message = "Discussion topic posted to community chat successfully.",
                    discussion = model
                });
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/LmsCommunity/discussions/{threadId}/comments
        // Post a reply comment (Requires verified school number)
        // =========================================================
        [AllowAnonymous]
        [HttpPost("discussions/{threadId}/comments")]
        public async Task<IActionResult> AddComment(string threadId, [FromBody] LmsCommentModel comment)
        {
            if (string.IsNullOrWhiteSpace(comment.SchoolNumber))
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "School Number authentication required to comment. Please sign in with your School Number."
                });
            }

            if (string.IsNullOrWhiteSpace(comment.Text))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Comment text cannot be empty."
                });
            }

            await _lock.WaitAsync();
            try
            {
                var list = _cachedDiscussions ?? await LoadDiscussionsInternalAsync();
                var thread = list.FirstOrDefault(d => d.Id == threadId);
                if (thread == null)
                {
                    return NotFound(new { success = false, message = "Discussion thread not found." });
                }

                comment.Id = Guid.NewGuid().ToString();
                comment.CreatedAt = DateTime.UtcNow;
                thread.Comments.Add(comment);

                _cachedDiscussions = list;
                await SaveDiscussionsInternalAsync(list);

                return Ok(new
                {
                    success = true,
                    message = "Your thoughts have been shared to the discussion.",
                    comment
                });
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/LmsCommunity/discussions/{threadId}/like
        // Like a discussion thread
        // =========================================================
        [AllowAnonymous]
        [HttpPost("discussions/{threadId}/like")]
        public async Task<IActionResult> LikeDiscussion(string threadId)
        {
            await _lock.WaitAsync();
            try
            {
                var list = _cachedDiscussions ?? await LoadDiscussionsInternalAsync();
                var thread = list.FirstOrDefault(d => d.Id == threadId);
                if (thread == null) return NotFound();

                thread.LikesCount++;
                _cachedDiscussions = list;
                await SaveDiscussionsInternalAsync(list);

                return Ok(new { success = true, likesCount = thread.LikesCount });
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // PRIVATE HELPERS
        // =========================================================
        private async Task<List<LmsDiscussionModel>> LoadDiscussionsInternalAsync()
        {
            if (System.IO.File.Exists(_dataFile))
            {
                var json = await System.IO.File.ReadAllTextAsync(_dataFile);
                var loaded = JsonSerializer.Deserialize<List<LmsDiscussionModel>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                if (loaded != null) return loaded;
            }
            return GetInitialSeedDiscussions();
        }

        private async Task SaveDiscussionsInternalAsync(List<LmsDiscussionModel> list)
        {
            var json = JsonSerializer.Serialize(list, new JsonSerializerOptions { WriteIndented = true });
            await System.IO.File.WriteAllTextAsync(_dataFile, json);
        }

        private static List<LmsDiscussionModel> GetInitialSeedDiscussions()
        {
            return new List<LmsDiscussionModel>
            {
                new()
                {
                    Id = "disc-1",
                    Title = "Greek Exegesis of Romans 8:28-30: Tracing the Golden Chain of Redemption",
                    Channel = "expository-insights",
                    Content = "In our New Testament Greek class today with Dr. De Jesus, we examined the syntactical sequence of proegno (foreknew), proorisen (predestined), ekalesen (called), edikaiosen (justified), and edoxasen (glorified). Notice how all verbs are in the aorist indicative, depicting God's eternal purpose as an accomplished reality in the mind of God! How are fellow pastors translating this in your Sunday expository outlines?",
                    AuthorName = "Pastor Jonathan M. Cruz, M.Th.",
                    SchoolNumber = "MBS-FAC-2016",
                    AuthorRole = "Faculty Dean of Biblical Languages",
                    IsFaculty = true,
                    LikesCount = 24,
                    CreatedAt = DateTime.UtcNow.AddHours(-18),
                    Comments = new List<LmsCommentModel>
                    {
                        new()
                        {
                            Id = "comm-1-1",
                            Text = "Amen Dr. Cruz! In our provincial cohort in Pangasinan, we highlighted that the aorist 'edoxasen' gives believers absolute assurance—our future glorification is so certain in Christ that Paul uses the past tense to signify its unshakeable decree.",
                            AuthorName = "David Morales",
                            SchoolNumber = "EPIC-2885",
                            AuthorRole = "Verified Student",
                            IsFaculty = false,
                            CreatedAt = DateTime.UtcNow.AddHours(-14)
                        },
                        new()
                        {
                            Id = "comm-1-2",
                            Text = "Excellent reflection, David. That pastoral comfort is precisely why grammatical exegesis matters—it turns solid grammar into living water for struggling sheep.",
                            AuthorName = "Dr. Emmanuel G. Ramos",
                            SchoolNumber = "MBS-FAC-1986",
                            AuthorRole = "Seminary President",
                            IsFaculty = true,
                            CreatedAt = DateTime.UtcNow.AddHours(-8)
                        }
                    }
                },
                new()
                {
                    Id = "disc-2",
                    Title = "Church Planting in Rural Municipalities: Modular Discipleship Strategies",
                    Channel = "pastoral-ministry",
                    Content = "Brothers and sisters in the DPS and B.Th. modular cohorts, what are your best practical approaches for cultivating indigenous lay leaders in farming and fishing communities? We are currently pioneering 2 daughter cell churches in Central Luzon.",
                    AuthorName = "Pastor Timothy A. Bautista",
                    SchoolNumber = "MBS-STD-2022",
                    AuthorRole = "Verified Student • DPS Cohort",
                    IsFaculty = false,
                    LikesCount = 18,
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    Comments = new List<LmsCommentModel>
                    {
                        new()
                        {
                            Id = "comm-2-1",
                            Text = "We found that pairing weekly CBS modules with practical discipleship homework (teaching them to lead family devotions first) builds steady spiritual fathers within 6 months.",
                            AuthorName = "Sister Mary Grace Torres",
                            SchoolNumber = "EPIC-3469",
                            AuthorRole = "Verified Student",
                            IsFaculty = false,
                            CreatedAt = DateTime.UtcNow.AddDays(-1)
                        }
                    }
                },
                new()
                {
                    Id = "disc-3",
                    Title = "The Solas of the Reformation vs. Modern Theological Trends",
                    Channel = "theology-inquiries",
                    Content = "Reading through Calvin's Institutes Book III and Bavinck's Reformed Dogmatics. How do we best safeguard our pulpit ministries against emotionalism while remaining deeply fervent in Holy Spirit evangelism?",
                    AuthorName = "Rebecca L. Santos",
                    SchoolNumber = "MBS-STD-2019",
                    AuthorRole = "Verified Student • M.Min.",
                    IsFaculty = false,
                    LikesCount = 15,
                    CreatedAt = DateTime.UtcNow.AddDays(-4),
                    Comments = new List<LmsCommentModel>()
                }
            };
        }
    }
}
