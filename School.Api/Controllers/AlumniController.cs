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
    public class AlumniController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _dataFile;
        private static readonly SemaphoreSlim _lock = new(1, 1);
        private static JsonElement? _cachedContent;

        public AlumniController(IWebHostEnvironment env)
        {
            _env = env;
            var dataDir = Path.Combine(_env.ContentRootPath, "App_Data");
            if (!Directory.Exists(dataDir))
            {
                Directory.CreateDirectory(dataDir);
            }
            _dataFile = Path.Combine(dataDir, "alumni_data.json");
        }

        // =========================================================
        // GET: /api/Alumni
        // Public endpoint - viewable by everyone (students, public, visitors)
        // =========================================================
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAlumni()
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
                        Console.WriteLine($"[Alumni] Error reading file: {ex.Message}");
                    }
                }

                return Ok(new { isDefault = true });
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // PUT / POST: /api/Alumni
        // Admin update endpoint - saves new customized alumni data
        // =========================================================
        [HttpPut]
        [HttpPost]
        public async Task<IActionResult> SaveAlumni([FromBody] JsonElement payload)
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
                    message = "Alumni and ministry achievers saved successfully.",
                    savedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = $"Failed to save alumni data: {ex.Message}"
                });
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/Alumni/reset
        // Admin reset endpoint - restores factory defaults
        // =========================================================
        [HttpPost("reset")]
        public async Task<IActionResult> ResetAlumni()
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
                    message = "Alumni and ministry achievers reset to official seminary defaults."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = $"Failed to reset alumni data: {ex.Message}"
                });
            }
            finally
            {
                _lock.Release();
            }
        }
    }
}
