using System.Security.Claims;
using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/customers")]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly LancerDbContext _context;
        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
        public CustomersController(LancerDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCustomers()
        {
            var userId = GetCurrentUserId();
            var customers = await _context.Customers
                .Where(c => c.UserId == userId)
                .ToListAsync();
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomer(int id)
        {
            var userId = GetCurrentUserId();
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            
            if (customer == null)
            {
                return NotFound();
            }

            return Ok(customer);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCustomer([FromBody] Customer customer)
        {
            var userId = GetCurrentUserId();
            customer.UserId = userId;
            customer.User = null; // Clear the navigation property to avoid validation issues

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] Customer customer)
        {
            if (id != customer.Id)
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingCustomer = await _context.Customers.FindAsync(id);
            if (existingCustomer == null)
            {
                return NotFound();
            }

            // Update all fields
            existingCustomer.Name = customer.Name;
            existingCustomer.EmailAddress = customer.EmailAddress;
            existingCustomer.DiscordName = customer.DiscordName;
            existingCustomer.DiscordLink = customer.DiscordLink;
            existingCustomer.FurAffinityName = customer.FurAffinityName;
            existingCustomer.FurAffinityLink = customer.FurAffinityLink;
            existingCustomer.TwitterName = customer.TwitterName;
            existingCustomer.TwitterLink = customer.TwitterLink;
            existingCustomer.InstagramName = customer.InstagramName;
            existingCustomer.InstagramLink = customer.InstagramLink;
            existingCustomer.TelegramName = customer.TelegramName;
            existingCustomer.TelegramLink = customer.TelegramLink;
            existingCustomer.OtherPlatformName = customer.OtherPlatformName;
            existingCustomer.OtherPlatformLink = customer.OtherPlatformLink;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CustomerExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return Ok(existingCustomer);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer deleted successfully" });
        }

        private bool CustomerExists(int id)
        {
            return _context.Customers.Any(e => e.Id == id);
        }
    }
}
