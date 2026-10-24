using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using School.Api.Models;

namespace School.Api.Controllers
{
    [ApiController]
    [Route("api/theme")]
    public class PublicThemeController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string _themeFilePath;
        private static GlobalThemeDto? _cachedTheme;

        public PublicThemeController(IWebHostEnvironment environment)
        {
            _environment = environment;
            var dataDir = Path.Combine(_environment.ContentRootPath, "App_Data");
            if (!Directory.Exists(dataDir))
            {
                Directory.CreateDirectory(dataDir);
            }
            _themeFilePath = Path.Combine(dataDir, "global_theme.json");
        }

        // =========================================================
        // GET: api/theme
        // Public endpoint to retrieve the admin-configured global theme
        // =========================================================
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<GlobalThemeDto>> GetGlobalTheme()
        {
            if (_cachedTheme != null)
            {
                return Ok(_cachedTheme);
            }

            if (System.IO.File.Exists(_themeFilePath))
            {
                try
                {
                    var json = await System.IO.File.ReadAllTextAsync(_themeFilePath);
                    var theme = JsonSerializer.Deserialize<GlobalThemeDto>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    if (theme != null)
                    {
                        _cachedTheme = theme;
                        return Ok(theme);
                    }
                }
                catch
                {
                    // Fallback to default
                }
            }

            var defaultTheme = new GlobalThemeDto();
            _cachedTheme = defaultTheme;
            return Ok(defaultTheme);
        }

        [AllowAnonymous]
        [HttpGet("public")]
        public async Task<ActionResult<GlobalThemeDto>> GetPublicTheme()
        {
            return await GetGlobalTheme();
        }

        // =========================================================
        // POST: api/theme
        // Saves the admin-configured global theme
        // =========================================================
        [HttpPost]
        public async Task<ActionResult<GlobalThemeDto>> SaveGlobalTheme([FromBody] GlobalThemeDto model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Theme payload is required." });
            }

            try
            {
                var json = JsonSerializer.Serialize(model, new JsonSerializerOptions
                {
                    WriteIndented = true
                });

                await System.IO.File.WriteAllTextAsync(_themeFilePath, json);
                _cachedTheme = model;

                return Ok(new
                {
                    message = "Global theme saved successfully.",
                    theme = model
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Failed to persist global theme configuration.",
                    error = ex.Message
                });
            }
        }

        [HttpPut]
        public async Task<ActionResult<GlobalThemeDto>> UpdateGlobalTheme([FromBody] GlobalThemeDto model)
        {
            return await SaveGlobalTheme(model);
        }
    }
}
