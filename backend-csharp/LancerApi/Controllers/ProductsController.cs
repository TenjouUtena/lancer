using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly LancerDbContext _context;

        public ProductsController(LancerDbContext context)
        {
            _context = context;
        }

        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            var userId = GetCurrentUserId();
            return await _context.Products
                .Where(p => p.UserId == userId)
                .Include(p => p.Artist)
                .Include(p => p.Base)
                .Include(p => p.Ad)
                .ToListAsync();
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var userId = GetCurrentUserId();
            var product = await _context.Products
                .Where(p => p.UserId == userId)
                .Include(p => p.Artist)
                .Include(p => p.Base)
                .Include(p => p.Ad)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            var userId = GetCurrentUserId();
            product.UserId = userId;
            product.User = null; // Clear the navigation property to avoid validation issues

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verify artist exists and belongs to user
            var artist = await _context.Artists
                .FirstOrDefaultAsync(a => a.Id == product.ArtistId && a.UserId == userId);
            if (artist == null)
            {
                return BadRequest("Artist not found");
            }

            // Verify base exists and belongs to user if provided
            if (product.BaseId.HasValue)
            {
                var artistBase = await _context.ArtistBases
                    .FirstOrDefaultAsync(ab => ab.Id == product.BaseId.Value && ab.UserId == userId);
                if (artistBase == null)
                {
                    return BadRequest("Artist base not found");
                }
            }

            // Verify ad image exists
            var ad = await _context.Images.FindAsync(product.AdId);
            if (ad == null)
            {
                return BadRequest("Ad image not found");
            }

            product.CreatedDate = DateTime.UtcNow;
            product.UpdatedDate = null;

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            // Verify the product exists and belongs to user
            var existingProduct = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (existingProduct == null)
            {
                return NotFound();
            }

            // Verify artist exists and belongs to user
            var artist = await _context.Artists
                .FirstOrDefaultAsync(a => a.Id == product.ArtistId && a.UserId == userId);
            if (artist == null)
            {
                return BadRequest("Artist not found");
            }

            // Verify base exists and belongs to user if provided
            if (product.BaseId.HasValue)
            {
                var artistBase = await _context.ArtistBases
                    .FirstOrDefaultAsync(ab => ab.Id == product.BaseId.Value && ab.UserId == userId);
                if (artistBase == null)
                {
                    return BadRequest("Artist base not found");
                }
            }

            // Verify ad image exists
            var ad = await _context.Images.FindAsync(product.AdId);
            if (ad == null)
            {
                return BadRequest("Ad image not found");
            }

            // Update the existing product
            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.ArtistId = product.ArtistId;
            existingProduct.BaseId = product.BaseId;
            existingProduct.AdId = product.AdId;
            existingProduct.Price = product.Price;
            existingProduct.IsAvailable = product.IsAvailable;
            existingProduct.UpdatedDate = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id, userId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var userId = GetCurrentUserId();
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/products/artist/5
        [HttpGet("artist/{artistId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByArtist(int artistId)
        {
            var userId = GetCurrentUserId();
            return await _context.Products
                .Where(p => p.UserId == userId)
                .Include(p => p.Artist)
                .Include(p => p.Base)
                .Include(p => p.Ad)
                .Where(p => p.ArtistId == artistId)
                .ToListAsync();
        }

        // GET: api/products/available
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<Product>>> GetAvailableProducts()
        {
            var userId = GetCurrentUserId();
            return await _context.Products
                .Where(p => p.UserId == userId)
                .Include(p => p.Artist)
                .Include(p => p.Base)
                .Include(p => p.Ad)
                .Where(p => p.IsAvailable)
                .ToListAsync();
        }

        private bool ProductExists(int id, string userId)
        {
            return _context.Products.Any(e => e.Id == id && e.UserId == userId);
        }
    }
}
