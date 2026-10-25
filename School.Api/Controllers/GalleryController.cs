using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace School.Api.Controllers
{
    public class GalleryPhotoModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = "ACADEMIC"; // ACADEMIC, ORDINATION, CHAPEL, MINISTRIES, FACILITIES
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Location { get; set; } = "Main Campus, Manila";
        public string Date { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public bool IsFeatured { get; set; } = false;
        public int LikesCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class GalleryController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _dataFile;
        private readonly string _uploadFolder;
        private static readonly SemaphoreSlim _lock = new(1, 1);

        public GalleryController(IWebHostEnvironment env)
        {
            _env = env;
            _dataFile = Path.Combine(_env.ContentRootPath, "gallery-photos.json");
            _uploadFolder = Path.Combine(_env.ContentRootPath, "root-uploads-gallery");
            Directory.CreateDirectory(_uploadFolder);
        }

        // =========================================================
        // GET: /api/Gallery
        // Publicly viewable by all accounts & visitors
        // =========================================================
        [HttpGet]
        public async Task<IActionResult> GetGallery()
        {
            await _lock.WaitAsync();
            try
            {
                var list = await LoadPhotosAsync();
                return Ok(list);
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/Gallery
        // Admin photo creation
        // =========================================================
        [HttpPost]
        public async Task<IActionResult> CreatePhoto([FromBody] GalleryPhotoModel model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Title) || string.IsNullOrWhiteSpace(model.ImageUrl))
            {
                return BadRequest(new { message = "Photo title and image are required." });
            }

            await _lock.WaitAsync();
            try
            {
                var list = await LoadPhotosAsync();
                var nextId = list.Count > 0 ? list.Max(p => p.Id) + 1 : 1;

                model.Id = nextId;
                model.CreatedAt = DateTime.UtcNow;
                if (string.IsNullOrWhiteSpace(model.Date))
                {
                    model.Date = DateTime.Now.ToString("MMMM yyyy");
                }
                if (string.IsNullOrWhiteSpace(model.Location))
                {
                    model.Location = "Main Campus, Manila";
                }

                list.Insert(0, model);
                await SavePhotosAsync(list);

                return Ok(model);
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/Gallery/upload
        // Multipart file upload for gallery photo
        // =========================================================
        [HttpPost("upload")]
        [RequestSizeLimit(15 * 1024 * 1024)] // 15 MB
        public async Task<IActionResult> UploadPhotoFile([FromForm] IFormFile file)
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

            var uniqueName = $"mbs-gallery-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}{ext}";
            var destinationPath = Path.Combine(_uploadFolder, uniqueName);

            await using (var stream = new FileStream(destinationPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/gallery-photos/{uniqueName}";
            return Ok(new
            {
                url = relativeUrl,
                fileName = uniqueName,
                size = file.Length
            });
        }

        // =========================================================
        // DELETE: /api/Gallery/{id}
        // Admin photo removal
        // =========================================================
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            await _lock.WaitAsync();
            try
            {
                var list = await LoadPhotosAsync();
                var existing = list.FirstOrDefault(p => p.Id == id);
                if (existing == null)
                {
                    return NotFound(new { message = $"Photo with ID {id} not found." });
                }

                list.Remove(existing);
                await SavePhotosAsync(list);

                return Ok(new { message = $"Photo {id} successfully removed." });
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/Gallery/{id}/like
        // Viewer like count increment
        // =========================================================
        [HttpPost("{id:int}/like")]
        public async Task<IActionResult> LikePhoto(int id)
        {
            await _lock.WaitAsync();
            try
            {
                var list = await LoadPhotosAsync();
                var photo = list.FirstOrDefault(p => p.Id == id);
                if (photo == null)
                {
                    return NotFound();
                }

                photo.LikesCount++;
                await SavePhotosAsync(list);

                return Ok(new { id = photo.Id, likesCount = photo.LikesCount });
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // POST: /api/Gallery/reset
        // Reset to initial curated seminary photos
        // =========================================================
        [HttpPost("reset")]
        public async Task<IActionResult> ResetToDefault()
        {
            await _lock.WaitAsync();
            try
            {
                var seed = GetInitialSeedPhotos();
                await SavePhotosAsync(seed);
                return Ok(seed);
            }
            finally
            {
                _lock.Release();
            }
        }

        // =========================================================
        // PRIVATE HELPERS
        // =========================================================
        private async Task<List<GalleryPhotoModel>> LoadPhotosAsync()
        {
            if (!System.IO.File.Exists(_dataFile))
            {
                var seed = GetInitialSeedPhotos();
                await SavePhotosAsync(seed);
                return seed;
            }

            try
            {
                var json = await System.IO.File.ReadAllTextAsync(_dataFile);
                var list = JsonSerializer.Deserialize<List<GalleryPhotoModel>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (list != null && list.Count > 0)
                {
                    bool mutated = false;
                    foreach (var p in list)
                    {
                        if (p.ImageUrl == "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80")
                        {
                            p.ImageUrl = "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80";
                            mutated = true;
                        }
                        else if (p.ImageUrl == "https://images.unsplash.com/photo-1532012164546-f432f2e3dd42?auto=format&fit=crop&w=1200&q=80")
                        {
                            p.ImageUrl = "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80";
                            mutated = true;
                        }
                    }

                    if (mutated)
                    {
                        await SavePhotosAsync(list);
                    }
                    return list;
                }

                return GetInitialSeedPhotos();
            }
            catch
            {
                return GetInitialSeedPhotos();
            }
        }

        private async Task SavePhotosAsync(List<GalleryPhotoModel> list)
        {
            var json = JsonSerializer.Serialize(list, new JsonSerializerOptions
            {
                WriteIndented = true
            });
            await System.IO.File.WriteAllTextAsync(_dataFile, json);
        }

        private static List<GalleryPhotoModel> GetInitialSeedPhotos()
        {
            return new List<GalleryPhotoModel>
            {
                new()
                {
                    Id = 1,
                    Title = "39th Annual Baccalaureate & Pastoral Ordination Convocation",
                    Category = "ORDINATION",
                    Description = "Conferring of the Bachelor of Theology (B.Th.) and Master of Divinity (M.Div.) degrees upon 64 ministerial candidates by the Seminary Faculty Council.",
                    ImageUrl = "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80",
                    Location = "Main Campus Auditorium, Manila",
                    Date = "October 2026",
                    Tags = "Graduation, B.Th., Ordination, Faculty Council",
                    IsFeatured = true,
                    LikesCount = 142
                },
                new()
                {
                    Id = 2,
                    Title = "Biblical Greek & Exegetical Hermeneutics Intensive",
                    Category = "ACADEMIC",
                    Description = "Undergraduate and pastoral students analyzing original Koine Greek manuscripts of the Pauline epistles during the Fall Exegetical Seminar.",
                    ImageUrl = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
                    Location = "Theology Hall Room 302",
                    Date = "September 2026",
                    Tags = "Greek Exegesis, Hermeneutics, Biblical Languages",
                    IsFeatured = true,
                    LikesCount = 98
                },
                new()
                {
                    Id = 3,
                    Title = "Seminary Campus Chapel Worship & Intercessory Assembly",
                    Category = "CHAPEL",
                    Description = "Weekly Wednesday morning student and faculty chapel gathering for liturgical prayer, Scripture reading, and worship before lectures.",
                    ImageUrl = "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
                    Location = "Grace Memorial Chapel, Main Campus",
                    Date = "October 2026",
                    Tags = "Chapel, Worship, Prayer, Seminary Fellowship",
                    IsFeatured = true,
                    LikesCount = 115
                },
                new()
                {
                    Id = 4,
                    Title = "Systematic Theology Lecture Series with Academic Dean",
                    Category = "ACADEMIC",
                    Description = "Dr. Benjamin Santos lecturing on the Doctrine of Scripture and Reformed Soteriology to second-year pastoral leadership candidates.",
                    ImageUrl = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
                    Location = "Academic Amphitheater",
                    Date = "October 2026",
                    Tags = "Systematic Theology, Dean Lecture, Doctrine",
                    IsFeatured = false,
                    LikesCount = 87
                },
                new()
                {
                    Id = 5,
                    Title = "Student Field Ministry & Rural Church-Planting Outreach",
                    Category = "MINISTRIES",
                    Description = "MBS student pastoral teams facilitating weekend expository Bible studies and community youth programs across regional church plants.",
                    ImageUrl = "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
                    Location = "Northern Luzon Ministry Center",
                    Date = "September 2026",
                    Tags = "Field Ministry, Missions, Church Planting, Outreach",
                    IsFeatured = true,
                    LikesCount = 134
                },
                new()
                {
                    Id = 6,
                    Title = "Theological Research Library & Patristic Archives",
                    Category = "FACILITIES",
                    Description = "Students conducting theological thesis research in our quiet archives containing over 35,000 commentary volumes and historical church records.",
                    ImageUrl = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
                    Location = "Charles Spurgeon Memorial Library",
                    Date = "August 2026",
                    Tags = "Library, Research, Archives, Exegesis",
                    IsFeatured = false,
                    LikesCount = 76
                },
                new()
                {
                    Id = 7,
                    Title = "Conferring of Ministerial Hoods & Sacred Commissioning",
                    Category = "ORDINATION",
                    Description = "Senior theological faculty laying hands and presenting sacred hoods upon newly ordained pastors entering full-time missionary service.",
                    ImageUrl = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
                    Location = "Main Campus Sanctuary",
                    Date = "October 2026",
                    Tags = "Ordination, Commissioning, Ministry Vows",
                    IsFeatured = false,
                    LikesCount = 92
                },
                new()
                {
                    Id = 8,
                    Title = "Modular Pastoral Training Cohort for Working Pastors",
                    Category = "ACADEMIC",
                    Description = "Executive weekend modular class where bivocational pastors gather for accelerated credit courses in church governance and homiletics.",
                    ImageUrl = "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80",
                    Location = "Executive Seminar Suite B",
                    Date = "September 2026",
                    Tags = "Modular Training, Pastoral Ministry, Homiletics",
                    IsFeatured = false,
                    LikesCount = 68
                },
                new()
                {
                    Id = 9,
                    Title = "Evening Campus Praise & Scripture Proclamation",
                    Category = "CHAPEL",
                    Description = "Evening student praise vigil featuring student testimonies and continuous Psalms proclamation before semester midterm examinations.",
                    ImageUrl = "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
                    Location = "Grace Memorial Chapel",
                    Date = "October 2026",
                    Tags = "Evening Chapel, Praise, Prayer Vigil",
                    IsFeatured = false,
                    LikesCount = 104
                },
                new()
                {
                    Id = 10,
                    Title = "Medical-Dental Mission & Compassion Ministry Practicum",
                    Category = "MINISTRIES",
                    Description = "MBS pastoral candidates partnering with Christian medical professionals to minister physical healing and the Gospel of Christ.",
                    ImageUrl = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
                    Location = "Southern Tagalog Community Outreach",
                    Date = "August 2026",
                    Tags = "Compassion Ministry, Medical Outreach, Evangelism",
                    IsFeatured = false,
                    LikesCount = 119
                },
                new()
                {
                    Id = 11,
                    Title = "Main Campus Administrative Complex & Faculty Quad",
                    Category = "FACILITIES",
                    Description = "Exterior view of the historic neoclassical facade of Mobile Bible School & Theological Seminary headquarters and registrar offices.",
                    ImageUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
                    Location = "Main Campus Headquarters, Manila",
                    Date = "July 2026",
                    Tags = "Campus, Architecture, Facilities, Headquarters",
                    IsFeatured = true,
                    LikesCount = 88
                },
                new()
                {
                    Id = 12,
                    Title = "Hermeneutics Practicum: Scripture Translation & Textual Criticism",
                    Category = "ACADEMIC",
                    Description = "Advanced students engaged in textual criticism of Hebrew Masoretic texts and Septuagint variants under faculty supervision.",
                    ImageUrl = "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80",
                    Location = "Manuscript Study Room",
                    Date = "October 2026",
                    Tags = "Hebrew, Textual Criticism, Hermeneutics, Exegesis",
                    IsFeatured = false,
                    LikesCount = 95
                }
            };
        }
    }
}
