using BCrypt.Net;
using School.Api.Data;
using School.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace School.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET ALL USERS
        // GET: api/users
        // =========================================================

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .OrderBy(u => u.FullName)
                .Select(u => new
                {
                    userId = u.UserId,
                    username = u.Username,
                    fullName = u.FullName,
                    roleId = u.RoleId,

                    role = u.Role != null
                        ? u.Role.RoleName
                        : null,

                    isActive = u.IsActive,
                    createdDate = u.CreatedDate
                })
                .ToListAsync();

            return Ok(users);
        }

        // =========================================================
        // GET USER BY ID
        // GET: api/users/1
        // =========================================================

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .Where(u => u.UserId == id)
                .Select(u => new
                {
                    userId = u.UserId,
                    username = u.Username,
                    fullName = u.FullName,
                    roleId = u.RoleId,

                    role = u.Role != null
                        ? u.Role.RoleName
                        : null,

                    isActive = u.IsActive,
                    createdDate = u.CreatedDate
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(user);
        }

        // =========================================================
        // CREATE USER
        // POST: api/users
        // ADMIN ONLY
        // =========================================================

        [HttpPost]
        [Authorize(Roles = "ADMIN,ADMINISTRATOR,SYSTEM ADMINISTRATOR,SUPER ADMIN")]
        public async Task<IActionResult> CreateUser(
            CreateUserRequest request)
        {
            // -----------------------------------------------------
            // Validate request
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new
                {
                    message = "Username is required."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Password is required."
                });
            }

            if (request.Password.Length < 6)
            {
                return BadRequest(new
                {
                    message = "Password must be at least 6 characters."
                });
            }

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new
                {
                    message = "Full name is required."
                });
            }

            if (request.RoleId <= 0)
            {
                return BadRequest(new
                {
                    message = "Role is required."
                });
            }

            // -----------------------------------------------------
            // Normalize username
            // -----------------------------------------------------

            var username = request.Username.Trim();

            // -----------------------------------------------------
            // Check duplicate username
            // -----------------------------------------------------

            var usernameExists = await _context.Users
                .AnyAsync(u => u.Username == username);

            if (usernameExists)
            {
                return Conflict(new
                {
                    message = "Username already exists."
                });
            }

            // -----------------------------------------------------
            // Validate role
            // -----------------------------------------------------

            var role = await _context.Roles
                .FirstOrDefaultAsync(r =>
                    r.RoleId == request.RoleId &&
                    r.IsActive);

            if (role == null)
            {
                return BadRequest(new
                {
                    message =
                        "Selected role does not exist or is inactive."
                });
            }

            // -----------------------------------------------------
            // Create user
            // -----------------------------------------------------

            var defaultCustomerId = await _context.Customers
                .OrderBy(c => c.CustomerId)
                .Select(c => c.CustomerId)
                .FirstOrDefaultAsync();

            var isRoleAdmin = IsMasterAdminRole(role.RoleName);

            var user = new User
            {
                Username = username,

                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        request.Password),

                FullName = request.FullName.Trim(),

                RoleId = role.RoleId,

                CustomerId = defaultCustomerId > 0 ? defaultCustomerId : 1,

                AccountType = isRoleAdmin ? "SYSTEM" : "STAFF",

                ApprovalStatus = "APPROVED",

                IsActive = true,

                CreatedDate = DateTime.Now
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            // -----------------------------------------------------
            // Return created user
            // -----------------------------------------------------

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.UserId },
                new
                {
                    userId = user.UserId,
                    username = user.Username,
                    fullName = user.FullName,
                    roleId = role.RoleId,
                    role = role.RoleName,
                    isActive = user.IsActive,
                    createdDate = user.CreatedDate
                });
        }

        // =========================================================
        // UPDATE USER
        // PUT: api/users/1
        // ADMIN ONLY
        // =========================================================

        [HttpPut("{id:int}")]
        [Authorize(Roles = "ADMIN,ADMINISTRATOR,SYSTEM ADMINISTRATOR,SUPER ADMIN")]
        public async Task<IActionResult> UpdateUser(
            int id,
            UpdateUserRequest request)
        {
            // -----------------------------------------------------
            // Find user
            // -----------------------------------------------------

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            // -----------------------------------------------------
            // Validate full name
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new
                {
                    message = "Full name is required."
                });
            }

            // -----------------------------------------------------
            // Validate role
            // -----------------------------------------------------

            var role = await _context.Roles
                .FirstOrDefaultAsync(r =>
                    r.RoleId == request.RoleId &&
                    r.IsActive);

            if (role == null)
            {
                return BadRequest(new
                {
                    message =
                        "Selected role does not exist or is inactive."
                });
            }

            // -----------------------------------------------------
            // Update user
            // -----------------------------------------------------

            user.FullName = request.FullName.Trim();

            user.RoleId = role.RoleId;

            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
            }

            if (!user.CustomerId.HasValue || user.CustomerId.Value <= 0)
            {
                var defId = await _context.Customers
                    .OrderBy(c => c.CustomerId)
                    .Select(c => c.CustomerId)
                    .FirstOrDefaultAsync();
                user.CustomerId = defId > 0 ? defId : 1;
            }

            var isRoleAdmin = IsMasterAdminRole(role.RoleName);

            if (isRoleAdmin)
            {
                user.AccountType = "SYSTEM";
            }
            else if (string.IsNullOrWhiteSpace(user.AccountType) || user.AccountType == "CLIENT")
            {
                user.AccountType = "STAFF";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "USER UPDATED SUCCESSFULLY.",

                userId = user.UserId,

                username = user.Username,

                fullName = user.FullName,

                roleId = role.RoleId,

                role = role.RoleName,

                isActive = user.IsActive
            });
        }

        // =========================================================
        // CHANGE PASSWORD
        // PUT: api/users/1/password
        // ADMIN ONLY
        // =========================================================

        [HttpPut("{id:int}/password")]
        [Authorize(Roles = "ADMIN,ADMINISTRATOR,SYSTEM ADMINISTRATOR,SUPER ADMIN")]
        public async Task<IActionResult> ChangePassword(
            int id,
            ChangePasswordRequest request)
        {
            // -----------------------------------------------------
            // Validate password
            // -----------------------------------------------------

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new
                {
                    message = "New password is required."
                });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new
                {
                    message =
                        "Password must be at least 6 characters."
                });
            }

            // -----------------------------------------------------
            // Find user
            // -----------------------------------------------------

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            // -----------------------------------------------------
            // Hash new password
            // -----------------------------------------------------

            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "PASSWORD UPDATED SUCCESSFULLY.",

                userId = user.UserId,

                username = user.Username
            });
        }

        // =========================================================
        // ACTIVATE / DEACTIVATE USER
        // PUT: api/users/1/status
        // ADMIN ONLY
        // =========================================================

        [HttpPut("{id:int}/status")]
        [Authorize(Roles = "ADMIN,ADMINISTRATOR,SYSTEM ADMINISTRATOR,SUPER ADMIN")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            UpdateUserStatusRequest request)
        {
            // -----------------------------------------------------
            // Find user
            // -----------------------------------------------------

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            // -----------------------------------------------------
            // Prevent administrator from deactivating themselves
            // -----------------------------------------------------

            var currentUserId = GetCurrentUserId();

            if (currentUserId.HasValue &&
                currentUserId.Value == id &&
                !request.IsActive)
            {
                return BadRequest(new
                {
                    message =
                        "You cannot deactivate your own administrator account."
                });
            }

            // -----------------------------------------------------
            // Update status
            // -----------------------------------------------------

            user.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = request.IsActive
                    ? "USER ACTIVATED."
                    : "USER DEACTIVATED.",

                userId = user.UserId,

                isActive = user.IsActive
            });
        }

        // =========================================================
        // DELETE USER
        // DELETE: api/users/1
        // ADMIN ONLY
        // =========================================================

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN,ADMINISTRATOR,SYSTEM ADMINISTRATOR,SUPER ADMIN")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            // -----------------------------------------------------
            // Find user
            // -----------------------------------------------------

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            // -----------------------------------------------------
            // Get currently logged-in user
            // -----------------------------------------------------

            var currentUserId = GetCurrentUserId();

            // -----------------------------------------------------
            // Prevent self-deletion
            // -----------------------------------------------------

            if (currentUserId.HasValue &&
                currentUserId.Value == id)
            {
                return BadRequest(new
                {
                    message =
                        "You cannot delete your own administrator account."
                });
            }

            // -----------------------------------------------------
            // Prevent deleting the last administrator
            // -----------------------------------------------------

            if (user.Role != null && IsMasterAdminRole(user.Role.RoleName))
            {
                var adminCount = await _context.Users
                    .Include(u => u.Role)
                    .CountAsync(u =>
                        u.Role != null &&
                        (u.Role.RoleName == "ADMIN" ||
                         u.Role.RoleName == "ADMINISTRATOR" ||
                         u.Role.RoleName == "SYSTEM ADMINISTRATOR" ||
                         u.Role.RoleName == "SUPER ADMIN" ||
                         u.Role.RoleName == "SUPERADMIN"));

                if (adminCount <= 1)
                {
                    return BadRequest(new
                    {
                        message =
                            "The last administrator account cannot be deleted."
                    });
                }
            }

            // -----------------------------------------------------
            // Delete user
            // -----------------------------------------------------

            // Remove CourseEnrollments & LessonProgresses
            var enrollments = await _context.CourseEnrollments
                .Where(e => e.UserId == user.UserId)
                .ToListAsync();
            if (enrollments.Count > 0)
            {
                var enrollmentIds = enrollments.Select(e => e.CourseEnrollmentId).ToList();
                var lessonProgresses = await _context.LessonProgresses
                    .Where(lp => enrollmentIds.Contains(lp.CourseEnrollmentId))
                    .ToListAsync();
                if (lessonProgresses.Count > 0)
                {
                    _context.LessonProgresses.RemoveRange(lessonProgresses);
                }
                _context.CourseEnrollments.RemoveRange(enrollments);
            }

            // Remove Certificates
            var certificates = await _context.Certificates
                .Where(c => c.UserId == user.UserId)
                .ToListAsync();
            if (certificates.Count > 0)
            {
                _context.Certificates.RemoveRange(certificates);
            }

            // Clean up corresponding ClientMember & Member if matched
            var clientMembers = await _context.ClientMembers
                .Where(cm => cm.Username == user.Username || (!string.IsNullOrEmpty(user.Email) && cm.Email == user.Email))
                .ToListAsync();
            foreach (var cm in clientMembers)
            {
                var memberId = cm.MemberId;
                _context.ClientMembers.Remove(cm);
                if (memberId > 0)
                {
                    var member = await _context.Members.FindAsync(memberId);
                    if (member != null)
                    {
                        _context.Members.Remove(member);
                    }
                }
            }

            _context.Users.Remove(user);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(new
                {
                    message =
                        "This user cannot be deleted because the account is associated with other records in the system."
                });
            }

            return Ok(new
            {
                message = "USER DELETED SUCCESSFULLY.",

                userId = user.UserId,

                username = user.Username,

                fullName = user.FullName
            });
        }

        // =========================================================
        // MASTER ADMIN ROLE CHECK
        // =========================================================

        private static bool IsMasterAdminRole(string? roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
            {
                return false;
            }

            var normalized = roleName.Trim().ToUpperInvariant();

            return normalized == "ADMIN" ||
                   normalized == "ADMINISTRATOR" ||
                   normalized == "SYSTEM ADMINISTRATOR" ||
                   normalized == "SUPER ADMIN" ||
                   normalized == "SUPERADMIN";
        }

        // =========================================================
        // CURRENT USER ID
        // =========================================================

        private int? GetCurrentUserId()
        {
            // -----------------------------------------------------
            // Try NameIdentifier
            // -----------------------------------------------------

            var userIdClaim =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (int.TryParse(
                userIdClaim,
                out var userId))
            {
                return userId;
            }

            // -----------------------------------------------------
            // Try JWT "sub"
            // -----------------------------------------------------

            var subjectClaim =
                User.FindFirstValue("sub");

            if (int.TryParse(
                subjectClaim,
                out userId))
            {
                return userId;
            }

            return null;
        }
    }

    // =============================================================
    // REQUEST MODELS
    // =============================================================

    public class CreateUserRequest
    {
        public string Username { get; set; }
            = string.Empty;

        public string Password { get; set; }
            = string.Empty;

        public string FullName { get; set; }
            = string.Empty;

        public int RoleId { get; set; }
    }

    public class UpdateUserRequest
    {
        public string FullName { get; set; }
            = string.Empty;

        public int RoleId { get; set; }

        public bool? IsActive { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string NewPassword { get; set; }
            = string.Empty;
    }

    public class UpdateUserStatusRequest
    {
        public bool IsActive { get; set; }
    }
}