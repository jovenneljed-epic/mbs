using System.Linq;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace School.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AboutContentController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _dataFile;
        private static readonly SemaphoreSlim _lock = new(1, 1);
        private static JsonElement? _cachedContent;

        public AboutContentController(IWebHostEnvironment env)
        {
            _env = env;
            var dataDir = Path.Combine(_env.ContentRootPath, "App_Data");
            if (!Directory.Exists(dataDir))
            {
                Directory.CreateDirectory(dataDir);
            }
            _dataFile = Path.Combine(dataDir, "about_content.json");
        }

        // =========================================================
        // GET: /api/AboutContent
        // Public endpoint - viewable by everyone (students, public, visitors)
        // =========================================================
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAboutContent()
        {
            await _lock.WaitAsync();
            try
            {
                if (_cachedContent.HasValue)
                {
                    return Ok(_cachedContent.Value);
                }

                if (System.IO.File.Exists(_dataFile))
                {
                    try
                    {
                        var json = await System.IO.File.ReadAllTextAsync(_dataFile);
                        using var doc = JsonDocument.Parse(json);
                        _cachedContent = doc.RootElement.Clone();
                        return Ok(_cachedContent.Value);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[AboutContent] Error reading file: {ex.Message}");
                    }
                }

                // If file doesn't exist yet, return 404 or empty object so client defaults kick in
                return Ok(new { isDefault = true });
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // PUT / POST: /api/AboutContent
        // Admin update endpoint - saves new customized about/campus content
        // =========================================================
        [HttpPut]
        [HttpPost]
        public async Task<IActionResult> SaveAboutContent([FromBody] JsonElement payload)
        {
            await _lock.WaitAsync();
            try
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                var json = JsonSerializer.Serialize(payload, options);
                await System.IO.File.WriteAllTextAsync(_dataFile, json);
                
                using var doc = JsonDocument.Parse(json);
                _cachedContent = doc.RootElement.Clone();

                return Ok(new
                {
                    success = true,
                    message = "Institutional dossier content saved successfully.",
                    savedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = $"Failed to save about content: {ex.Message}"
                });
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/AboutContent/upload-faculty-photo
        // Admin photo upload for faculty and deans
        // =========================================================
        [HttpPost("upload-faculty-photo")]
        [RequestSizeLimit(15 * 1024 * 1024)] // 15 MB
        public async Task<IActionResult> UploadFacultyPhoto([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No image file provided." });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(ext))
            {
                return BadRequest(new { message = "Only JPG, PNG, WEBP, or GIF images are allowed." });
            }

            var facultyFolder = Path.Combine(_env.ContentRootPath, "root-uploads-faculty");
            if (!Directory.Exists(facultyFolder))
            {
                Directory.CreateDirectory(facultyFolder);
            }

            var uniqueName = $"faculty-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}{ext}";
            var destinationPath = Path.Combine(facultyFolder, uniqueName);

            await using (var stream = new FileStream(destinationPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/faculty-photos/{uniqueName}";
            return Ok(new
            {
                url = relativeUrl,
                fileName = uniqueName,
                size = file.Length
            });
        }

        // =========================================================
        // POST: /api/AboutContent/upload-history-photo
        // Admin photo upload for MBS history archives
        // =========================================================
        [HttpPost("upload-history-photo")]
        [RequestSizeLimit(20 * 1024 * 1024)] // 20 MB
        public async Task<IActionResult> UploadHistoryPhoto([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No image file provided." });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(ext))
            {
                return BadRequest(new { message = "Only JPG, PNG, WEBP, or GIF images are allowed." });
            }

            var historyFolder = Path.Combine(_env.ContentRootPath, "root-uploads-history");
            if (!Directory.Exists(historyFolder))
            {
                Directory.CreateDirectory(historyFolder);
            }

            var uniqueName = $"history-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}{ext}";
            var destinationPath = Path.Combine(historyFolder, uniqueName);

            await using (var stream = new FileStream(destinationPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/history-photos/{uniqueName}";
            return Ok(new
            {
                url = relativeUrl,
                fileName = uniqueName,
                size = file.Length
            });
        }

        // =========================================================
        // POST: /api/AboutContent/reset
        // Admin reset endpoint - restores factory defaults
        // =========================================================
        [HttpPost("reset")]
        public async Task<IActionResult> ResetAboutContent()
        {
            await _lock.WaitAsync();
            try
            {
                if (System.IO.File.Exists(_dataFile))
                {
                    System.IO.File.Delete(_dataFile);
                }
                _cachedContent = null;

                return Ok(new
                {
                    success = true,
                    message = "Institutional dossier content reset to official seminary defaults."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = $"Failed to reset about content: {ex.Message}"
                });
            }
            finally
            {
                _lock.Release();
            }
        }
    }
}
