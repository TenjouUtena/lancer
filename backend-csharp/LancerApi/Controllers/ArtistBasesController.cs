using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LancerApi.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/artist-bases")]
    [Authorize]
    public class ArtistBasesController : ControllerBase
    {
        private readonly LancerDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly S3Service _s3Service;

        public ArtistBasesController(LancerDbContext context, IWebHostEnvironment environment, S3Service s3Service)
        {
            _context = context;
            _environment = environment;
            _s3Service = s3Service;
        }

        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }

        [HttpGet]
        public async Task<IActionResult> GetAllArtistBases()
        {
            var userId = GetCurrentUserId();
            var artistBases = await _context.ArtistBases
                .Where(ab => ab.UserId == userId)
                .Include(ab => ab.Tags)
                .ThenInclude(abt => abt.Tag)
                .ToListAsync();
            
            var result = artistBases.Select(ab => new ArtistBaseWithTagsDto
            {
                Id = ab.Id,
                Name = ab.Name,
                Url = GetAccessibleUrl(ab.Url),
                Price = ab.Price,
                Tags = ab.Tags.Select(abt => abt.Tag).ToList()
            }).ToList();
            
            return Ok(result);
        }

        [HttpGet("by-artist/{artistId}")]
        public async Task<IActionResult> GetArtistBasesByArtist(int artistId)
        {
            var userId = GetCurrentUserId();
            var artistBases = await _context.ArtistBases
                .Where(ab => ab.UserId == userId)
                .Where(ab => ab.Name.Contains($"Artist{artistId}") || ab.Url.Contains($"artist/{artistId}"))
                .ToListAsync();

            foreach (var ab in artistBases)
            {
                ab.Url = GetAccessibleUrl(ab.Url);
            }

            return Ok(artistBases);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArtistBase(int id)
        {
            var userId = GetCurrentUserId();
            var artistBase = await _context.ArtistBases
                .FirstOrDefaultAsync(ab => ab.Id == id && ab.UserId == userId);
            
            if (artistBase == null)
            {
                return NotFound();
            }

            artistBase.Url = GetAccessibleUrl(artistBase.Url);
            return Ok(artistBase);
        }

        [HttpPost]
        public async Task<IActionResult> CreateArtistBase([FromBody] ArtistBase artistBase)
        {
            artistBase.UserId = GetCurrentUserId();
            artistBase.User = null; // Clear the navigation property to avoid validation issues

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.ArtistBases.Add(artistBase);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetArtistBase), new { id = artistBase.Id }, artistBase);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> CreateArtistBaseWithImage([FromForm] ArtistBaseUploadModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            string? imageUrl = null;

            // Handle file upload if provided
            if (model.ImageFile != null && model.ImageFile.Length > 0)
            {
                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(model.ImageFile.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("Invalid file type. Only image files are allowed.");
                }

                // Validate file size (max 10MB)
                if (model.ImageFile.Length > 10 * 1024 * 1024)
                {
                    return BadRequest("File size too large. Maximum size is 10MB.");
                }

                // Generate unique key
                var key = $"user/{userId}/{Guid.NewGuid()}{fileExtension}";

                // Upload to S3
                using (var stream = model.ImageFile.OpenReadStream())
                {
                    await _s3Service.UploadFileAsync(stream, key);
                }

                // Set the URL to S3 key with prefix
                imageUrl = $"s3:{key}";
            }

            // Create the artist base
            var artistBase = new ArtistBase
            {
                Name = model.Name,
                Url = imageUrl ?? model.Url ?? string.Empty,
                Price = model.Price,
                UserId = userId
            };

            _context.ArtistBases.Add(artistBase);
            await _context.SaveChangesAsync();

            // Add tags if provided
            if (model.TagIds != null && model.TagIds.Any())
            {
                foreach (var tagId in model.TagIds)
                {
                    var artistBaseTag = new ArtistBaseTag
                    {
                        ArtistBaseId = artistBase.Id,
                        TagId = tagId
                    };
                    _context.ArtistBaseTags.Add(artistBaseTag);
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetArtistBase), new { id = artistBase.Id }, artistBase);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArtistBase(int id, [FromBody] ArtistBase artistBase)
        {
            if (id != artistBase.Id)
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var existingArtistBase = await _context.ArtistBases
                .FirstOrDefaultAsync(ab => ab.Id == id && ab.UserId == userId);
            if (existingArtistBase == null)
            {
                return NotFound();
            }

            existingArtistBase.Name = artistBase.Name;
            existingArtistBase.Url = artistBase.Url;
            existingArtistBase.Price = artistBase.Price;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ArtistBaseExists(id, userId))
                {
                    return NotFound();
                }
                throw;
            }

            return Ok(existingArtistBase);
        }

        [HttpPut("{id}/upload")]
        public async Task<IActionResult> UpdateArtistBaseWithImage(int id, [FromForm] ArtistBaseUploadModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var existingArtistBase = await _context.ArtistBases
                .FirstOrDefaultAsync(ab => ab.Id == id && ab.UserId == userId);
            if (existingArtistBase == null)
            {
                return NotFound();
            }

            string? imageUrl = existingArtistBase.Url;

            // Handle file upload if provided
            if (model.ImageFile != null && model.ImageFile.Length > 0)
            {
                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(model.ImageFile.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest("Invalid file type. Only image files are allowed.");
                }

                // Validate file size (max 10MB)
                if (model.ImageFile.Length > 10 * 1024 * 1024)
                {
                    return BadRequest("File size too large. Maximum size is 10MB.");
                }

                // Delete old file if exists
                await DeleteOldImage(existingArtistBase.Url);

                // Generate unique key
                var key = $"user/{userId}/{Guid.NewGuid()}{fileExtension}";

                // Upload to S3
                using (var stream = model.ImageFile.OpenReadStream())
                {
                    await _s3Service.UploadFileAsync(stream, key);
                }

                // Set the URL to S3 key with prefix
                imageUrl = $"s3:{key}";
            }

            // Update the artist base
            existingArtistBase.Name = model.Name;
            existingArtistBase.Url = imageUrl ?? model.Url ?? existingArtistBase.Url;
            existingArtistBase.Price = model.Price;

            // Update tags if provided
            if (model.TagIds != null)
            {
                // Remove existing tags
                var existingTags = await _context.ArtistBaseTags
                    .Where(abt => abt.ArtistBaseId == id)
                    .ToListAsync();
                _context.ArtistBaseTags.RemoveRange(existingTags);

                // Add new tags
                foreach (var tagId in model.TagIds)
                {
                    var artistBaseTag = new ArtistBaseTag
                    {
                        ArtistBaseId = id,
                        TagId = tagId
                    };
                    _context.ArtistBaseTags.Add(artistBaseTag);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ArtistBaseExists(id, userId))
                {
                    return NotFound();
                }
                throw;
            }

            return Ok(existingArtistBase);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArtistBase(int id)
        {
            var userId = GetCurrentUserId();
            var artistBase = await _context.ArtistBases
                .FirstOrDefaultAsync(ab => ab.Id == id && ab.UserId == userId);
            if (artistBase == null)
            {
                return NotFound();
            }

            // Delete associated file if exists
            await DeleteOldImage(artistBase.Url);

            _context.ArtistBases.Remove(artistBase);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Artist base deleted successfully" });
        }

        private string GetAccessibleUrl(string storedUrl)
        {
            if (storedUrl.StartsWith("s3:"))
            {
                var key = storedUrl.Substring(3);
                return _s3Service.GetPresignedUrl(key, TimeSpan.FromHours(1));
            }
            return storedUrl;
        }

        private async Task DeleteOldImage(string storedUrl)
        {
            if (string.IsNullOrEmpty(storedUrl)) return;

            if (storedUrl.StartsWith("s3:"))
            {
                var key = storedUrl.Substring(3);
                await _s3Service.DeleteFileAsync(key);
            }
            else if (storedUrl.StartsWith("/uploads/"))
            {
                var filePath = Path.Combine(_environment.WebRootPath, storedUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
        }

        private bool ArtistBaseExists(int id, string userId)
        {
            return _context.ArtistBases.Any(e => e.Id == id && e.UserId == userId);
        }
    }

    public class ArtistBaseUploadModel
    {
        public string Name { get; set; } = string.Empty;
        public string? Url { get; set; }
        public decimal Price { get; set; }
        public IFormFile? ImageFile { get; set; }
        public List<int> TagIds { get; set; } = new List<int>();
    }

    public class ArtistBaseWithTagsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public List<ArtistBaseTagSet> Tags { get; set; } = new List<ArtistBaseTagSet>();
    }
}
