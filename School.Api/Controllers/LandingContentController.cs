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
    public class LandingContentController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _dataFile;
        private static readonly SemaphoreSlim _lock = new(1, 1);
        private static JsonElement? _cachedContent;

        public LandingContentController(IWebHostEnvironment env)
        {
            _env = env;
            var dataDir = Path.Combine(_env.ContentRootPath, "App_Data");
            if (!Directory.Exists(dataDir))
            {
                Directory.CreateDirectory(dataDir);
            }
            _dataFile = Path.Combine(dataDir, "landing_content.json");
        }

        // =========================================================
        // GET: /api/LandingContent
        // Public endpoint - fetches admin-configured landing page content
        // =========================================================
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetContent()
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
                        Console.WriteLine($"[LandingContent] Error reading file: {ex.Message}");
                    }
                }

                return NoContent();
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/LandingContent
        // Saves landing page customizations from CMS to server file
        // =========================================================
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> SaveContent([FromBody] JsonElement content)
        {
            await _lock.WaitAsync();
            try
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                var json = JsonSerializer.Serialize(content, options);
                await System.IO.File.WriteAllTextAsync(_dataFile, json);
                _cachedContent = content.Clone();
                return Ok(new { success = true, message = "Landing page content saved to server successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to save landing content", details = ex.Message });
            }
            finally
            {
                _lock.Release();
            }
        }
    }
}
