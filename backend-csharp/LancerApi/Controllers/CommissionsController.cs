using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LancerApi.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CommissionsController : ControllerBase
    {
        private readonly LancerDbContext _context;

        public CommissionsController(LancerDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Commission>>> GetCommissions()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            return await _context.Commissions
                .Where(c => c.UserId == userId)
                .Include(c => c.BaseCreator)
                .Include(c => c.ArtistBase)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Commission>> GetCommission(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var commission = await _context.Commissions
                .Where(c => c.UserId == userId && c.Id == id)
                .Include(c => c.BaseCreator)
                .Include(c => c.ArtistBase)
                .FirstOrDefaultAsync();

            if (commission == null)
            {
                return NotFound();
            }

            return commission;
        }

        [HttpPost]
        public async Task<ActionResult<Commission>> PostCommission(Commission commission)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            commission.UserId = userId;
            commission.User = null; // Clear the navigation property to avoid validation issues
            commission.CreatedAt = DateTime.UtcNow;

            _context.Commissions.Add(commission);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCommission", new { id = commission.Id }, commission);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCommission(int id, Commission commission)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            if (id != commission.Id)
            {
                return BadRequest();
            }

            var existingCommission = await _context.Commissions
                .Where(c => c.UserId == userId && c.Id == id)
                .FirstOrDefaultAsync();

            if (existingCommission == null)
            {
                return NotFound();
            }

            // Update properties
            existingCommission.Name = commission.Name;
            existingCommission.Description = commission.Description;
            existingCommission.Price = commission.Price;
            existingCommission.Type = commission.Type;
            existingCommission.Slots = commission.Slots;
            existingCommission.BaseCreatorId = commission.BaseCreatorId;
            existingCommission.ArtistBaseId = commission.ArtistBaseId;
            existingCommission.AdvertImageUrl = commission.AdvertImageUrl;
            existingCommission.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommissionExists(id))
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCommission(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var commission = await _context.Commissions
                .Where(c => c.UserId == userId && c.Id == id)
                .FirstOrDefaultAsync();

            if (commission == null)
            {
                return NotFound();
            }

            _context.Commissions.Remove(commission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CommissionExists(int id)
        {
            return _context.Commissions.Any(c => c.Id == id);
        }
    }
}