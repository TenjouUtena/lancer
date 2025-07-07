using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly LancerDbContext _context;

        public ProductsController(LancerDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .Include(p => p.Artist)
                .Include(p => p.Base)
                .Include(p => p.Ad)
                .ToListAsync();
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verify artist exists
            var artist = await _context.Artists.FindAsync(product.ArtistId);
            if (artist == null)
            {
                return BadRequest("Artist not found");
            }

            // Verify base exists if provided
            if (product.BaseId.HasValue)
            {
                var artistBase = await _context.ArtistBases.FindAsync(product.BaseId.Value);
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

            // Verify artist exists
            var artist = await _context.Artists.FindAsync(product.ArtistId);
            if (artist == null)
            {
                return BadRequest("Artist not found");
            }

            // Verify base exists if provided
            if (product.BaseId.HasValue)
            {
                var artistBase = await _context.ArtistBases.FindAsync(product.BaseId.Value);
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

            product.UpdatedDate = DateTime.UtcNow;

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
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
            var product = await _context.Products.FindAsync(id);
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
            return await _context.Products
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
            return await _context.Products
                .Include(p => p.Artist)
                .Include(p => p.Base)
                .Include(p => p.Ad)
                .Where(p => p.IsAvailable)
                .ToListAsync();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}