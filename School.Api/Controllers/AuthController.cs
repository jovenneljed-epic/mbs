
using BCrypt.Net;

using School.Api.Data;
using School.Api.Models;
using School.Core.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace School.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPermissionService _permissionService;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration configuration,
            IPermissionService permissionService)
        {
            _context = context;
            _configuration = configuration;
            _permissionService = permissionService;
        }

        // ============================================================
        // REGISTER
        // ============================================================

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(
            [FromBody] UserRegisterRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message = "INVALID REQUEST."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new
                {
                    message = "USERNAME IS REQUIRED."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "PASSWORD IS REQUIRED."
                });
            }

            if (string.IsNullOrWhiteSpace(request.MemberCode))
            {
                return BadRequest(new
                {
                    message = "MEMBER CODE IS REQUIRED."
                });
            }

            if (string.IsNullOrWhiteSpace(request.LastName))
            {
                return BadRequest(new
                {
                    message = "LAST NAME IS REQUIRED."
                });
            }

            var username = request.Username.Trim();
            var lastName = request.LastName.Trim();
            var memberCode = request.MemberCode.Trim();

            // --------------------------------------------------------
            // CHECK USERNAME
            // --------------------------------------------------------

            var existingUser =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u =>
                        u.Username != null &&
                        u.Username.ToLower() ==
                        username.ToLower());

            if (existingUser != null)
            {
                return Conflict(new
                {
                    message = "USERNAME ALREADY EXISTS."
                });
            }

            // --------------------------------------------------------
            // FIND MEMBER
            // --------------------------------------------------------

            var member =
                await _context.Members
                    .FirstOrDefaultAsync(m =>
                        m.MemberCode == memberCode &&
                        m.LastName != null &&
                        m.LastName.ToLower() ==
                        lastName.ToLower());

            if (member == null)
            {
                return BadRequest(new
                {
                    message = "MEMBER RECORD NOT FOUND."
                });
            }

            // --------------------------------------------------------
            // MEMBER CUSTOMER
            // --------------------------------------------------------

            if (member.CustomerId <= 0)
            {
                return BadRequest(new
                {
                    message =
                        "MEMBER IS NOT ASSIGNED TO A CUSTOMER."
                });
            }

            // --------------------------------------------------------
            // MEMBER STATUS
            // --------------------------------------------------------

            if (!string.Equals(
                    member.Status?.Trim(),
                    "ACTIVE",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message =
                        "MEMBER ACCOUNT IS INACTIVE."
                });
            }

            // --------------------------------------------------------
            // EXISTING MEMBER ACCOUNT
            // --------------------------------------------------------

            var existingMemberAccount =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u =>
                        u.MemberId == member.MemberId);

            if (existingMemberAccount != null)
            {
                return Conflict(new
                {
                    message =
                        "THIS MEMBER ALREADY HAS AN ACCOUNT."
                });
            }

            // --------------------------------------------------------
            // GET MEMBER ROLE
            // --------------------------------------------------------

            var memberRole =
                await _context.Roles
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r =>
                        r.RoleName != null &&
                        (r.RoleName.ToUpper() == "MEMBER" ||
                         r.RoleName.ToUpper() == "MEMBERS" ||
                         r.RoleName.ToUpper() == "STUDENT" ||
                         r.RoleName.ToUpper() == "STUDENTS") &&
                        r.IsActive)
                ?? await _context.Roles
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.IsActive && r.RoleId != 1);

            if (memberRole == null)
            {
                return StatusCode(500, new
                {
                    message =
                        "STUDENT / MEMBER ROLE IS NOT CONFIGURED."
                });
            }

            // --------------------------------------------------------
            // HASH PASSWORD
            // --------------------------------------------------------

            var passwordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.Password);

            // --------------------------------------------------------
            // CREATE USER (ACTIVATED FOR AUTHENTIC STUDENT)
            // --------------------------------------------------------

            var user = new User
            {
                Username = username,

                PasswordHash = passwordHash,

                FullName =
                    $"{member.FirstName} {member.LastName}"
                        .Trim(),

                RoleId = memberRole.RoleId,

                MemberId = member.MemberId,

                CustomerId = member.CustomerId > 0 ? member.CustomerId : 1,

                IsActive = true,

                ApprovalStatus = "APPROVED",

                AccountType = "STUDENT",

                Email =
                    string.IsNullOrWhiteSpace(request.Email)
                        ? null
                        : request.Email.Trim(),

                CreatedDate = DateTime.UtcNow
            };

            _context.Users.Add(user);

            // --------------------------------------------------------
            // PROVISION CLIENTMEMBER FOR CLIENT PORTAL ACCESS
            // --------------------------------------------------------

            var clientRole = await _context.ClientRoles
                .FirstOrDefaultAsync(cr => cr.RoleName == "CLIENT_MEMBER" || cr.RoleName == "STUDENT")
                ?? await _context.ClientRoles.OrderByDescending(cr => cr.ClientRoleId).FirstOrDefaultAsync();

            var clientMember = new ClientMember
            {
                CustomerId = member.CustomerId > 0 ? member.CustomerId : 1,
                MemberId = member.MemberId,
                ClientRoleId = clientRole?.ClientRoleId ?? 4,
                Username = username,
                PasswordHash = passwordHash,
                Status = "ACTIVE",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };
            _context.ClientMembers.Add(clientMember);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "STUDENT ACCOUNT ACTIVATED SUCCESSFULLY! You can now sign in.",

                userId = user.UserId,

                username = user.Username,

                fullName = user.FullName,

                roleId = user.RoleId,

                memberId = user.MemberId,

                studentId = member.MemberCode
            });
        }

        // ============================================================
        // LOGIN
        // ============================================================

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(
            [FromBody] UserLoginRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message = "INVALID REQUEST."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new
                {
                    message = "USERNAME IS REQUIRED."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "PASSWORD IS REQUIRED."
                });
            }

            var username =
                request.Username.Trim();

            // ========================================================
            // DATABASE DIAGNOSTICS
            // ========================================================

            var dbConnection =
                _context.Database.GetDbConnection();

            Console.WriteLine();
            Console.WriteLine("========================================");
            Console.WriteLine("SCHOOL AUTH LOGIN");
            Console.WriteLine("========================================");

            Console.WriteLine(
                $"DATABASE: {dbConnection.Database}");

            Console.WriteLine(
                $"SERVER:   {dbConnection.DataSource}");

            Console.WriteLine(
                $"USERNAME FROM REQUEST: [{request.Username}]");

            Console.WriteLine(
                $"TRIMMED USERNAME: [{username}]");

            Console.WriteLine("========================================");

            // ========================================================
            // USER QUERY
            //
            // IMPORTANT:
            // Do NOT Include Role here.
            //
            // We first prove that the Users table can locate the
            // account without any relationship JOIN.
            // ========================================================

            var userQuery =
                _context.Users
                    .Where(u =>
                        u.Username != null &&
                        u.Username.ToLower() ==
                        username.ToLower());

            Console.WriteLine("EF USER QUERY:");
            Console.WriteLine(
                userQuery.ToQueryString());

            Console.WriteLine("========================================");

            var user =
                await userQuery
                    .FirstOrDefaultAsync();

            // ========================================================
            // USER DEBUG
            // ========================================================

            Console.WriteLine(
                $"LOGIN USER: " +
                $"{(user == null ? "NOT FOUND" : user.Username)}");

            if (user == null)
            {
                Console.WriteLine(
                    "LOGIN FAILED: USER NOT FOUND.");

                Console.WriteLine(
                    "========================================");

                return InvalidCredentials();
            }

            Console.WriteLine(
                $"USER ID: {user.UserId}");

            Console.WriteLine(
                $"ROLE ID: {user.RoleId}");

            Console.WriteLine(
                $"MEMBER ID: {user.MemberId}");

            Console.WriteLine(
                $"CUSTOMER ID: {user.CustomerId}");

            Console.WriteLine(
                $"ACTIVE: {user.IsActive}");

            Console.WriteLine(
                $"APPROVAL: {user.ApprovalStatus}");

            Console.WriteLine(
                $"ACCOUNT TYPE: {user.AccountType}");

            Console.WriteLine(
                $"HASH EXISTS: " +
                $"{!string.IsNullOrWhiteSpace(user.PasswordHash)}");

            // ========================================================
            // PASSWORD
            // ========================================================

            var passwordMatches =
                VerifyPassword(
                    request.Password,
                    user.PasswordHash);

            Console.WriteLine(
                $"PASSWORD MATCH: {passwordMatches}");

            Console.WriteLine(
                "========================================");

            if (!passwordMatches)
            {
                return InvalidCredentials();
            }

            // ========================================================
            // LOAD ROLE EXPLICITLY
            //
            // We intentionally do this as a separate query instead
            // of relying on user.Role.
            // ========================================================

            var role =
                await _context.Roles
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r =>
                        r.RoleId == user.RoleId);

            if (role == null)
            {
                Console.WriteLine(
                    $"ROLE NOT FOUND. RoleId={user.RoleId}");

                return Unauthorized(new
                {
                    message =
                        "USER ROLE IS NOT CONFIGURED."
                });
            }

            if (!role.IsActive)
            {
                return Unauthorized(new
                {
                    message =
                        "USER ROLE IS INACTIVE."
                });
            }

            var roleName =
                NormalizeRole(
                    role.RoleName);

            if (string.IsNullOrWhiteSpace(roleName))
            {
                return Unauthorized(new
                {
                    message =
                        "USER ROLE IS NOT CONFIGURED."
                });
            }

            Console.WriteLine(
                $"ROLE NAME: {roleName}");

            // ========================================================
            // APPROVAL STATUS
            // ========================================================

            var approvalStatus =
                NormalizeApprovalStatus(
                    user.ApprovalStatus);

            if (approvalStatus == "PENDING")
            {
                return Unauthorized(new
                {
                    message =
                        "YOUR ACCOUNT IS STILL PENDING APPROVAL."
                });
            }

            if (approvalStatus == "REJECTED")
            {
                return Unauthorized(new
                {
                    message =
                        "YOUR ACCOUNT HAS BEEN REJECTED."
                });
            }

            // ========================================================
            // ACTIVE USER
            // ========================================================

            if (!user.IsActive)
            {
                return Unauthorized(new
                {
                    message =
                        "YOUR ACCOUNT IS INACTIVE."
                });
            }

            // ========================================================
            // LOAD MEMBER
            // ========================================================

            Member? member = null;

            if (user.MemberId.HasValue)
            {
                member =
                    await _context.Members
                        .AsNoTracking()
                        .FirstOrDefaultAsync(m =>
                            m.MemberId ==
                            user.MemberId.Value);
            }

            // ========================================================
            // MEMBER ACCOUNT VALIDATION
            // ========================================================

            if (roleName == "MEMBER")
            {
                var validation =
                    ValidateMemberAccount(
                        user,
                        member);

                if (validation != null)
                {
                    return validation;
                }
            }

            // ========================================================
            // CLIENT VALIDATION
            // ========================================================

            if (roleName == "CLIENT")
            {
                if (!user.CustomerId.HasValue ||
                    user.CustomerId.Value <= 0)
                {
                    return Unauthorized(new
                    {
                        message =
                            "CLIENT ACCOUNT IS NOT ASSIGNED " +
                            "TO A CUSTOMER."
                    });
                }
            }

            // ========================================================
            // CUSTOMER VALIDATION
            //
            // ADMIN accounts are allowed without CustomerId.
            // Other accounts require a CustomerId.
            // ========================================================

            if (
                roleName != "ADMIN" &&
                (!user.CustomerId.HasValue ||
                 user.CustomerId.Value <= 0))
            {
                return Unauthorized(new
                {
                    message =
                        "USER IS NOT ASSIGNED TO A CUSTOMER."
                });
            }

            // ========================================================
            // LOAD PERMISSIONS
            //
            // IPermissionService does not expose a method that returns
            // normal role permissions.
            //
            // Therefore we load the normal Permissions table directly.
            //
            // CLIENT permissions are intentionally handled separately
            // by PermissionService through GetClientPermissionsAsync().
            // ========================================================

            var permissions =
                await GetRolePermissionsAsync(
                    user.RoleId,
                    roleName);

            // ========================================================
            // GENERATE TOKEN
            // ========================================================

            var token =
                GenerateJwtToken(
                    user,
                    roleName);

            // ========================================================
            // LAST LOGIN
            // ========================================================

            user.LastLoginDate =
                DateTime.Now;

            await _context.SaveChangesAsync();

            // ========================================================
            // SUCCESS
            // ========================================================

            return Ok(new
            {
                message =
                    "LOGIN SUCCESSFUL.",

                userId =
                    user.UserId,

                username =
                    user.Username,

                fullName =
                    user.FullName,

                roleId =
                    user.RoleId,

                role =
                    roleName,

                memberId =
                    user.MemberId,

                customerId =
                    user.CustomerId,

                approvalStatus =
                    approvalStatus,

                accountType =
                    user.AccountType,

                member =
                    BuildMemberResponse(
                        member),

                permissions =
                    permissions,

                token =
                    token
            });
        }

        // ============================================================
        // CURRENT USER
        // ============================================================

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userId =
                GetCurrentUserId();

            if (!userId.HasValue)
            {
                return Unauthorized(new
                {
                    message =
                        "INVALID TOKEN."
                });
            }

            var user =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u =>
                        u.UserId ==
                        userId.Value);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message =
                        "USER NOT FOUND."
                });
            }

            var role =
                await _context.Roles
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r =>
                        r.RoleId ==
                        user.RoleId);

            var roleName =
                NormalizeRole(
                    role?.RoleName);

            Member? member = null;

            if (user.MemberId.HasValue)
            {
                member =
                    await _context.Members
                        .AsNoTracking()
                        .FirstOrDefaultAsync(m =>
                            m.MemberId ==
                            user.MemberId.Value);
            }

            object permissions;

            if (roleName == "CLIENT")
            {
                permissions =
                    await _permissionService
                        .GetClientPermissionsAsync(
                            User);
            }
            else
            {
                permissions =
                    await GetRolePermissionsAsync(
                        user.RoleId,
                        roleName);
            }

            return Ok(new
            {
                userId =
                    user.UserId,

                username =
                    user.Username,

                fullName =
                    user.FullName,

                roleId =
                    user.RoleId,

                role =
                    roleName,

                memberId =
                    user.MemberId,

                customerId =
                    user.CustomerId,

                approvalStatus =
                    NormalizeApprovalStatus(
                        user.ApprovalStatus),

                accountType =
                    user.AccountType,

                member =
                    BuildMemberResponse(
                        member),

                permissions =
                    permissions
            });
        }

        // ============================================================
        // ROLE PERMISSIONS
        // ============================================================

        private async Task<List<object>>
            GetRolePermissionsAsync(
                int roleId,
                string roleName)
        {
            // --------------------------------------------------------
            // ADMIN HAS FULL ACCESS
            // --------------------------------------------------------

            if (roleName == "ADMIN")
            {
                return new List<object>
                {
                    new
                    {
                        module = "*",
                        canView = true,
                        canCreate = true,
                        canEdit = true,
                        canDelete = true,
                        canExport = true,
                        canManage = true
                    }
                };
            }

            // --------------------------------------------------------
            // NORMAL ROLE PERMISSIONS
            // --------------------------------------------------------

            var permissions =
                await _context.Permissions
                    .AsNoTracking()
                    .Where(p =>
                        p.RoleId == roleId)
                    .Select(p => new
                    {
                        module =
                            p.Module,

                        canView =
                            p.CanView,

                        canCreate =
                            p.CanCreate,

                        canEdit =
                            p.CanEdit,

                        canDelete =
                            p.CanDelete,

                        canExport =
                            p.CanExport
                    })
                    .ToListAsync();

            return permissions
                .Select(p => (object)p)
                .ToList();
        }

        // ============================================================
        // MEMBER VALIDATION
        // ============================================================

        private IActionResult? ValidateMemberAccount(
            User user,
            Member? member)
        {
            if (member == null)
            {
                return Unauthorized(new
                {
                    message =
                        "MEMBER RECORD NOT FOUND."
                });
            }

            // --------------------------------------------------------
            // YOUR MEMBER MODEL USES Status
            // NOT IsActive
            // --------------------------------------------------------

            if (!string.Equals(
                    member.Status?.Trim(),
                    "ACTIVE",
                    StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized(new
                {
                    message =
                        "MEMBER ACCOUNT IS INACTIVE."
                });
            }

            if (user.MemberId !=
                member.MemberId)
            {
                return Unauthorized(new
                {
                    message =
                        "MEMBER ACCOUNT CONFIGURATION IS INVALID."
                });
            }

            if (member.CustomerId <= 0)
            {
                return Unauthorized(new
                {
                    message =
                        "MEMBER IS NOT ASSIGNED TO A CUSTOMER."
                });
            }

            return null;
        }

        // ============================================================
        // MEMBER RESPONSE
        // ============================================================

        private static object? BuildMemberResponse(
            Member? member)
        {
            if (member == null)
            {
                return null;
            }

            // IMPORTANT:
            // This matches your actual Member model.
            //
            // There is NO Suffix property.
            // There is NO IsActive property.

            return new
            {
                memberId =
                    member.MemberId,

                customerId =
                    member.CustomerId,

                memberCode =
                    member.MemberCode,

                firstName =
                    member.FirstName,

                middleName =
                    member.MiddleName,

                lastName =
                    member.LastName,

                gender =
                    member.Gender,

                birthDate =
                    member.BirthDate,

                contactNumber =
                    member.ContactNumber,

                address =
                    member.Address,

                civilStatus =
                    member.CivilStatus,

                ministry =
                    member.Ministry,

                dateJoined =
                    member.DateJoined,

                status =
                    member.Status,

                photoPath =
                    member.PhotoPath
            };
        }

        // ============================================================
        // PASSWORD VERIFICATION
        // ============================================================

        private static bool VerifyPassword(
            string password,
            string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(
                    password))
            {
                return false;
            }

            if (string.IsNullOrWhiteSpace(
                    passwordHash))
            {
                return false;
            }

            try
            {
                return BCrypt.Net.BCrypt.Verify(
                    password,
                    passwordHash);
            }
            catch
            {
                return false;
            }
        }

        // ============================================================
        // JWT
        // ============================================================

        private string GenerateJwtToken(
            User user,
            string roleName)
        {
            var jwtKey =
                _configuration["Jwt:Key"];

            var jwtIssuer =
                _configuration["Jwt:Issuer"];

            var jwtAudience =
                _configuration["Jwt:Audience"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException(
                    "JWT KEY IS NOT CONFIGURED.");
            }

            if (string.IsNullOrWhiteSpace(jwtIssuer))
            {
                throw new InvalidOperationException(
                    "JWT ISSUER IS NOT CONFIGURED.");
            }

            if (string.IsNullOrWhiteSpace(jwtAudience))
            {
                throw new InvalidOperationException(
                    "JWT AUDIENCE IS NOT CONFIGURED.");
            }

            var expirationMinutes = 60;

            if (
                int.TryParse(
                    _configuration[
                        "Jwt:ExpirationMinutes"],
                    out var configuredExpiration) &&
                configuredExpiration > 0)
            {
                expirationMinutes =
                    configuredExpiration;
            }

            var claims =
                new List<Claim>
                {
                    new Claim(
                        ClaimTypes.NameIdentifier,
                        user.UserId.ToString()),

                    new Claim(
                        ClaimTypes.Name,
                        user.Username ?? string.Empty),

                    new Claim(
                        ClaimTypes.Role,
                        roleName),

                    new Claim(
                        "UserId",
                        user.UserId.ToString()),

                    new Claim(
                        "RoleId",
                        user.RoleId.ToString())
                };

            if (user.MemberId.HasValue)
            {
                claims.Add(
                    new Claim(
                        "MemberId",
                        user.MemberId.Value.ToString()));
            }

            if (user.CustomerId.HasValue)
            {
                claims.Add(
                    new Claim(
                        "CustomerId",
                        user.CustomerId.Value.ToString()));
            }

            if (!string.IsNullOrWhiteSpace(
                    user.AccountType))
            {
                claims.Add(
                    new Claim(
                        "AccountType",
                        user.AccountType));
            }

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        jwtKey));

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256);

            var token =
                new JwtSecurityToken(
                    issuer:
                        jwtIssuer,

                    audience:
                        jwtAudience,

                    claims:
                        claims,

                    expires:
                        DateTime.UtcNow.AddMinutes(
                            expirationMinutes),

                    signingCredentials:
                        credentials);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }

        // ============================================================
        // CURRENT USER ID
        // ============================================================

        private int? GetCurrentUserId()
        {
            var claims =
                new[]
                {
                    ClaimTypes.NameIdentifier,
                    "UserId",
                    "userId",
                    "sub"
                };

            foreach (var claimType in claims)
            {
                var value =
                    User.FindFirst(
                        claimType)?.Value;

                if (
                    int.TryParse(
                        value,
                        out var userId) &&
                    userId > 0)
                {
                    return userId;
                }
            }

            return null;
        }

        // ============================================================
        // ROLE NORMALIZATION
        // ============================================================

        private static string NormalizeRole(
            string? roleName)
        {
            if (string.IsNullOrWhiteSpace(
                    roleName))
            {
                return string.Empty;
            }

            return roleName
                .Trim()
                .ToUpperInvariant();
        }

        // ============================================================
        // APPROVAL STATUS
        // ============================================================

        private static string NormalizeApprovalStatus(
            string? status)
        {
            if (string.IsNullOrWhiteSpace(
                    status))
            {
                // Existing accounts without an approval status
                // remain valid for backward compatibility.
                return "APPROVED";
            }

            return status
                .Trim()
                .ToUpperInvariant();
        }

        // ============================================================
        // INVALID CREDENTIALS
        // ============================================================

        private IActionResult InvalidCredentials()
        {
            return Unauthorized(new
            {
                message =
                    "INVALID USERNAME OR PASSWORD."
            });
        }

        // ============================================================
        // LOGIN DTO
        // ============================================================

        public class UserLoginRequest
        {
            public string Username { get; set; } =
                string.Empty;

            public string Password { get; set; } =
                string.Empty;
        }

        // ============================================================
        // REGISTER DTO
        // ============================================================

        public class UserRegisterRequest
        {
            public string Username { get; set; } =
                string.Empty;

            public string Password { get; set; } =
                string.Empty;

            public string MemberCode { get; set; } =
                string.Empty;

            public string LastName { get; set; } =
                string.Empty;

            public string? Email { get; set; }
        }
    }
}
