using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/artist-bases")]
    public class ArtistBasesController : ControllerBase
    {
        private readonly LancerDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ArtistBasesController(LancerDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllArtistBases()
        {
            var artistBases = await _context.ArtistBases
                .Include(ab => ab.Tags)
                .ThenInclude(abt => abt.Tag)
                .ToListAsync();
            
            var result = artistBases.Select(ab => new ArtistBaseWithTagsDto
            {
                Id = ab.Id,
                Name = ab.Name,
                Url = ab.Url,
                Price = ab.Price,
                Tags = ab.Tags.Select(abt => abt.Tag).ToList()
            }).ToList();
            
            return Ok(result);
        }

        [HttpGet("by-artist/{artistId}")]
        public async Task<IActionResult> GetArtistBasesByArtist(int artistId)
        {
            var artistBases = await _context.ArtistBases
                .Where(ab => ab.Name.Contains($"Artist{artistId}") || ab.Url.Contains($"artist/{artistId}"))
                .ToListAsync();
            return Ok(artistBases);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArtistBase(int id)
        {
            var artistBase = await _context.ArtistBases.FindAsync(id);
            
            if (artistBase == null)
            {
                return NotFound();
            }

            return Ok(artistBase);
        }

        [HttpPost]
        public async Task<IActionResult> CreateArtistBase([FromBody] ArtistBase artistBase)
        {
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

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");
                
                // Ensure uploads directory exists
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ImageFile.CopyToAsync(stream);
                }

                // Set the URL for the uploaded image
                imageUrl = $"/uploads/{fileName}";
            }

            // Create the artist base
            var artistBase = new ArtistBase
            {
                Name = model.Name,
                Url = imageUrl ?? model.Url ?? string.Empty,
                Price = model.Price
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

            var existingArtistBase = await _context.ArtistBases.FindAsync(id);
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
                if (!ArtistBaseExists(id))
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

            var existingArtistBase = await _context.ArtistBases.FindAsync(id);
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

                // Delete old file if it exists and is a local upload
                if (!string.IsNullOrEmpty(existingArtistBase.Url) && existingArtistBase.Url.StartsWith("/uploads/"))
                {
                    var oldFilePath = Path.Combine(_environment.WebRootPath, existingArtistBase.Url.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");
                
                // Ensure uploads directory exists
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ImageFile.CopyToAsync(stream);
                }

                // Set the URL for the uploaded image
                imageUrl = $"/uploads/{fileName}";
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
                if (!ArtistBaseExists(id))
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
            var artistBase = await _context.ArtistBases.FindAsync(id);
            if (artistBase == null)
            {
                return NotFound();
            }

            // Delete associated file if it exists and is a local upload
            if (!string.IsNullOrEmpty(artistBase.Url) && artistBase.Url.StartsWith("/uploads/"))
            {
                var filePath = Path.Combine(_environment.WebRootPath, artistBase.Url.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.ArtistBases.Remove(artistBase);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Artist base deleted successfully" });
        }

        private bool ArtistBaseExists(int id)
        {
            return _context.ArtistBases.Any(e => e.Id == id);
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
