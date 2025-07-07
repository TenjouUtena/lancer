using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly LancerDbContext _context;

        public OrdersController(LancerDbContext context)
        {
            _context = context;
        }

        [HttpGet("top_5")]
        public async Task<IActionResult> GetTop5Orders()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .ToListAsync();

            return Ok(orders);
        }
    }
}
