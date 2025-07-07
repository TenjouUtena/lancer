using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/artists")]
    public class ArtistsController : ControllerBase
    {
        private readonly LancerDbContext _context;

        public ArtistsController(LancerDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllArtists()
        {
            var artists = await _context.Artists.ToListAsync();
            return Ok(artists);
        }

        [HttpGet("top_5")]
        public async Task<IActionResult> GetTop5Artists()
        {
            var artists = await _context.Artists
                .Take(5)
                .ToListAsync();

            return Ok(artists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArtist(int id)
        {
            var artist = await _context.Artists.FindAsync(id);
            
            if (artist == null)
            {
                return NotFound();
            }

            return Ok(artist);
        }

        [HttpPost]
        public async Task<IActionResult> CreateArtist([FromBody] Artist artist)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Artists.Add(artist);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetArtist), new { id = artist.Id }, artist);
        }

        [HttpPut]
        public async Task<IActionResult> CreateArtistLegacy([FromBody] Artist artist)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Artists.Add(artist);
            await _context.SaveChangesAsync();

            return Ok("Ok");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArtist(int id, [FromBody] Artist artist)
        {
            if (id != artist.Id)
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingArtist = await _context.Artists.FindAsync(id);
            if (existingArtist == null)
            {
                return NotFound();
            }

            existingArtist.Name = artist.Name;
            existingArtist.Faname = artist.Faname;
            existingArtist.Platform = artist.Platform;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ArtistExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return Ok(existingArtist);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArtist(int id)
        {
            var artist = await _context.Artists.FindAsync(id);
            if (artist == null)
            {
                return NotFound();
            }

            _context.Artists.Remove(artist);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Artist deleted successfully" });
        }

        private bool ArtistExists(int id)
        {
            return _context.Artists.Any(e => e.Id == id);
        }
    }
}
