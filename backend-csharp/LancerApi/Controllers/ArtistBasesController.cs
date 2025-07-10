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

        [HttpGet("search")]
        public async Task<IActionResult> SearchArtistBases(
            [FromQuery] string? name = null,
            [FromQuery] string? tags = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null)
        {
            var userId = GetCurrentUserId();
            var query = _context.ArtistBases
                .Where(ab => ab.UserId == userId)
                .Include(ab => ab.Tags)
                .ThenInclude(abt => abt.Tag)
                .AsQueryable();

            // Filter by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(ab => ab.Name.ToLower().Contains(name.ToLower()));
            }

            // Filter by price range if provided
            if (minPrice.HasValue)
            {
                query = query.Where(ab => ab.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(ab => ab.Price <= maxPrice.Value);
            }

            // Filter by tags if provided
            if (!string.IsNullOrWhiteSpace(tags))
            {
                var tagIds = tags.Split(',')
                    .Where(t => int.TryParse(t.Trim(), out _))
                    .Select(t => int.Parse(t.Trim()))
                    .ToList();

                if (tagIds.Any())
                {
                    // Find artist bases that have ALL specified tags (AND logic)
                    query = query.Where(ab => tagIds.All(tagId => 
                        ab.Tags.Any(abt => abt.TagId == tagId)));
                }
            }

            var artistBases = await query.ToListAsync();
            
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
            var config = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var maxImageSize = config.GetValue<long>("FileUpload:MaxFileSizeBytes");
            var maxPsdSize = config.GetValue<long>("FileUpload:MaxPsdFileSizeBytes");
            
            string? imageUrl = null;
            string originalPsdUrl = string.Empty;
            string modifiedPsdUrl = string.Empty;
            string originalPsdFileName = string.Empty;
            long originalPsdFileSize = 0;
            string modifiedPsdFileName = string.Empty;
            long modifiedPsdFileSize = 0;

            // Handle image file upload if provided
            if (model.ImageFile != null && model.ImageFile.Length > 0)
            {
                var validationResult = await ValidateAndUploadImageFile(model.ImageFile, userId, maxImageSize);
                if (validationResult.Error != null)
                {
                    return BadRequest(validationResult.Error);
                }
                imageUrl = validationResult.Url;
            }

            // Handle original PSD file upload if provided
            if (model.OriginalPsdFile != null && model.OriginalPsdFile.Length > 0)
            {
                var validationResult = await ValidateAndUploadPsdFile(model.OriginalPsdFile, userId, maxPsdSize);
                if (validationResult.Error != null)
                {
                    return BadRequest(validationResult.Error);
                }
                originalPsdUrl = validationResult.Url!;
                originalPsdFileName = model.OriginalPsdFile.FileName;
                originalPsdFileSize = model.OriginalPsdFile.Length;
            }

            // Handle modified PSD file upload if provided
            if (model.ModifiedPsdFile != null && model.ModifiedPsdFile.Length > 0)
            {
                var validationResult = await ValidateAndUploadPsdFile(model.ModifiedPsdFile, userId, maxPsdSize);
                if (validationResult.Error != null)
                {
                    return BadRequest(validationResult.Error);
                }
                modifiedPsdUrl = validationResult.Url!;
                modifiedPsdFileName = model.ModifiedPsdFile.FileName;
                modifiedPsdFileSize = model.ModifiedPsdFile.Length;
            }

            // Create the artist base
            var artistBase = new ArtistBase
            {
                Name = model.Name,
                Url = imageUrl ?? model.Url ?? string.Empty,
                Price = model.Price,
                OriginalPsdUrl = originalPsdUrl ?? model.OriginalPsdUrl ?? string.Empty,
                ModifiedPsdUrl = modifiedPsdUrl ?? model.ModifiedPsdUrl ?? string.Empty,
                OriginalPsdFileName = originalPsdFileName,
                OriginalPsdFileSize = originalPsdFileSize,
                ModifiedPsdFileName = modifiedPsdFileName,
                ModifiedPsdFileSize = modifiedPsdFileSize,
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
            var config = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var maxImageSize = config.GetValue<long>("FileUpload:MaxFileSizeBytes");
            var maxPsdSize = config.GetValue<long>("FileUpload:MaxPsdFileSizeBytes");
            
            var existingArtistBase = await _context.ArtistBases
                .FirstOrDefaultAsync(ab => ab.Id == id && ab.UserId == userId);
            if (existingArtistBase == null)
            {
                return NotFound();
            }

            string? imageUrl = existingArtistBase.Url;
            string originalPsdUrl = existingArtistBase.OriginalPsdUrl;
            string modifiedPsdUrl = existingArtistBase.ModifiedPsdUrl;
            string originalPsdFileName = existingArtistBase.OriginalPsdFileName;
            long originalPsdFileSize = existingArtistBase.OriginalPsdFileSize;
            string modifiedPsdFileName = existingArtistBase.ModifiedPsdFileName;
            long modifiedPsdFileSize = existingArtistBase.ModifiedPsdFileSize;

            // Handle image file upload if provided
            if (model.ImageFile != null && model.ImageFile.Length > 0)
            {
                var validationResult = await ValidateAndUploadImageFile(model.ImageFile, userId, maxImageSize);
                if (validationResult.Error != null)
                {
                    return BadRequest(validationResult.Error);
                }
                
                // Delete old image file if exists
                await DeleteOldImage(existingArtistBase.Url);
                imageUrl = validationResult.Url;
            }

            // Handle original PSD file upload if provided
            if (model.OriginalPsdFile != null && model.OriginalPsdFile.Length > 0)
            {
                var validationResult = await ValidateAndUploadPsdFile(model.OriginalPsdFile, userId, maxPsdSize);
                if (validationResult.Error != null)
                {
                    return BadRequest(validationResult.Error);
                }
                
                // Delete old original PSD file if exists
                if (!string.IsNullOrEmpty(existingArtistBase.OriginalPsdUrl) && existingArtistBase.OriginalPsdUrl.StartsWith("s3:"))
                {
                    var oldKey = existingArtistBase.OriginalPsdUrl.Substring(3);
                    await _s3Service.DeleteFileAsync(oldKey);
                }
                
                originalPsdUrl = validationResult.Url!;
                originalPsdFileName = model.OriginalPsdFile.FileName;
                originalPsdFileSize = model.OriginalPsdFile.Length;
            }

            // Handle modified PSD file upload if provided
            if (model.ModifiedPsdFile != null && model.ModifiedPsdFile.Length > 0)
            {
                var validationResult = await ValidateAndUploadPsdFile(model.ModifiedPsdFile, userId, maxPsdSize);
                if (validationResult.Error != null)
                {
                    return BadRequest(validationResult.Error);
                }
                
                // Delete old modified PSD file if exists
                if (!string.IsNullOrEmpty(existingArtistBase.ModifiedPsdUrl) && existingArtistBase.ModifiedPsdUrl.StartsWith("s3:"))
                {
                    var oldKey = existingArtistBase.ModifiedPsdUrl.Substring(3);
                    await _s3Service.DeleteFileAsync(oldKey);
                }
                
                modifiedPsdUrl = validationResult.Url!;
                modifiedPsdFileName = model.ModifiedPsdFile.FileName;
                modifiedPsdFileSize = model.ModifiedPsdFile.Length;
            }

            // Update the artist base
            existingArtistBase.Name = model.Name;
            existingArtistBase.Url = imageUrl ?? model.Url ?? existingArtistBase.Url;
            existingArtistBase.Price = model.Price;
            existingArtistBase.OriginalPsdUrl = originalPsdUrl ?? model.OriginalPsdUrl ?? existingArtistBase.OriginalPsdUrl;
            existingArtistBase.ModifiedPsdUrl = modifiedPsdUrl ?? model.ModifiedPsdUrl ?? existingArtistBase.ModifiedPsdUrl;
            existingArtistBase.OriginalPsdFileName = originalPsdFileName;
            existingArtistBase.OriginalPsdFileSize = originalPsdFileSize;
            existingArtistBase.ModifiedPsdFileName = modifiedPsdFileName;
            existingArtistBase.ModifiedPsdFileSize = modifiedPsdFileSize;

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

            // Delete associated files if they exist
            await DeleteOldImage(artistBase.Url);
            await DeletePsdFiles(artistBase.OriginalPsdUrl, artistBase.ModifiedPsdUrl);

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

        private async Task<FileUploadResult> ValidateAndUploadImageFile(IFormFile file, string userId, long maxSize)
        {
            var config = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var allowedExtensions = config.GetSection("FileUpload:AllowedImageExtensions").Get<string[]>() ?? 
                                  new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return new FileUploadResult { Error = "Invalid file type. Only image files are allowed." };
            }

            if (file.Length > maxSize)
            {
                return new FileUploadResult { Error = $"File size too large. Maximum size is {maxSize / (1024 * 1024)}MB." };
            }

            var key = $"user/{userId}/images/{Guid.NewGuid()}{fileExtension}";

            using (var stream = file.OpenReadStream())
            {
                await _s3Service.UploadFileAsync(stream, key);
            }

            return new FileUploadResult { Url = $"s3:{key}" };
        }

        private async Task<FileUploadResult> ValidateAndUploadPsdFile(IFormFile file, string userId, long maxSize)
        {
            var config = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var allowedExtensions = config.GetSection("FileUpload:AllowedPsdExtensions").Get<string[]>() ?? 
                                  new[] { ".psd" };
            
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return new FileUploadResult { Error = "Invalid file type. Only PSD files are allowed." };
            }

            if (file.Length > maxSize)
            {
                return new FileUploadResult { Error = $"File size too large. Maximum size is {maxSize / (1024 * 1024)}MB." };
            }

            var key = $"user/{userId}/psd/{Guid.NewGuid()}{fileExtension}";

            using (var stream = file.OpenReadStream())
            {
                await _s3Service.UploadPsdFileAsync(stream, key, file.FileName);
            }

            return new FileUploadResult { Url = $"s3:{key}" };
        }

        private async Task DeletePsdFiles(string originalPsdUrl, string modifiedPsdUrl)
        {
            if (!string.IsNullOrEmpty(originalPsdUrl) && originalPsdUrl.StartsWith("s3:"))
            {
                var key = originalPsdUrl.Substring(3);
                await _s3Service.DeleteFileAsync(key);
            }

            if (!string.IsNullOrEmpty(modifiedPsdUrl) && modifiedPsdUrl.StartsWith("s3:"))
            {
                var key = modifiedPsdUrl.Substring(3);
                await _s3Service.DeleteFileAsync(key);
            }
        }
    }

    public class ArtistBaseUploadModel
    {
        public string Name { get; set; } = string.Empty;
        public string? Url { get; set; }
        public decimal Price { get; set; }
        public IFormFile? ImageFile { get; set; }
        public IFormFile? OriginalPsdFile { get; set; }
        public IFormFile? ModifiedPsdFile { get; set; }
        public string? OriginalPsdUrl { get; set; }
        public string? ModifiedPsdUrl { get; set; }
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

    public class FileUploadResult
    {
        public string? Url { get; set; }
        public string? Error { get; set; }
    }
}
