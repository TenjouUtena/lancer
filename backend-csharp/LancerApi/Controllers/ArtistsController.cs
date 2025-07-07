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

        [HttpGet("top_5")]
        public async Task<IActionResult> GetTop5Artists()
        {
            var artists = await _context.Artists
                .Take(5)
                .ToListAsync();

            return Ok(artists);
        }

        [HttpPut]
        public async Task<IActionResult> CreateArtist([FromBody] Artist artist)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Artists.Add(artist);
            await _context.SaveChangesAsync();

            return Ok("Ok");
        }
    }
}
