using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/tags")]
    public class TagsController : ControllerBase
    {
        private readonly LancerDbContext _context;

        public TagsController(LancerDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTags()
        {
            var tags = await _context.ArtistBaseTagSets.ToListAsync();
            return Ok(tags);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTag(int id)
        {
            var tag = await _context.ArtistBaseTagSets.FindAsync(id);
            
            if (tag == null)
            {
                return NotFound();
            }

            return Ok(tag);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTag([FromBody] ArtistBaseTagSet tag)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if tag with same name already exists
            var existingTag = await _context.ArtistBaseTagSets
                .FirstOrDefaultAsync(t => t.Name.ToLower() == tag.Name.ToLower());
            
            if (existingTag != null)
            {
                return Conflict(new { message = "Tag with this name already exists", existingTag });
            }

            _context.ArtistBaseTagSets.Add(tag);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTag), new { id = tag.Id }, tag);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTag(int id, [FromBody] ArtistBaseTagSet tag)
        {
            if (id != tag.Id)
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingTag = await _context.ArtistBaseTagSets.FindAsync(id);
            if (existingTag == null)
            {
                return NotFound();
            }

            // Check if another tag with same name already exists
            var duplicateTag = await _context.ArtistBaseTagSets
                .FirstOrDefaultAsync(t => t.Name.ToLower() == tag.Name.ToLower() && t.Id != id);
            
            if (duplicateTag != null)
            {
                return Conflict(new { message = "Tag with this name already exists" });
            }

            existingTag.Name = tag.Name;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TagExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return Ok(existingTag);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTag(int id)
        {
            var tag = await _context.ArtistBaseTagSets.FindAsync(id);
            if (tag == null)
            {
                return NotFound();
            }

            // Check if tag is being used by any artist bases
            var isUsed = await _context.ArtistBaseTags.AnyAsync(abt => abt.TagId == id);
            if (isUsed)
            {
                return BadRequest(new { message = "Cannot delete tag that is currently in use by artist bases" });
            }

            _context.ArtistBaseTagSets.Remove(tag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag deleted successfully" });
        }

        private bool TagExists(int id)
        {
            return _context.ArtistBaseTagSets.Any(e => e.Id == id);
        }
    }
}
