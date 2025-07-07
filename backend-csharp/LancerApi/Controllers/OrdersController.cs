using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly LancerDbContext _context;

        public OrdersController(LancerDbContext context)
        {
            _context = context;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderLines)
                    .ThenInclude(ol => ol.Product)
                        .ThenInclude(p => p.Artist)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        // GET: api/orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderLines)
                    .ThenInclude(ol => ol.Product)
                        .ThenInclude(p => p.Artist)
                .Include(o => o.OrderLines)
                    .ThenInclude(ol => ol.Product)
                        .ThenInclude(p => p.Base)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // GET: api/orders/top_5
        [HttpGet("top_5")]
        public async Task<ActionResult<IEnumerable<Order>>> GetTopOrders()
        {
            return await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderLines)
                    .ThenInclude(ol => ol.Product)
                        .ThenInclude(p => p.Artist)
                .Where(o => o.Status != OrderStatus.Completed && o.Status != OrderStatus.Cancelled)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .ToListAsync();
        }

        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verify customer exists
            var customer = await _context.Customers.FindAsync(orderDto.CustomerId);
            if (customer == null)
            {
                return BadRequest("Customer not found");
            }

            var order = new Order
            {
                CustomerId = orderDto.CustomerId,
                OrderDate = orderDto.OrderDate,
                Status = orderDto.Status,
                Notes = orderDto.Notes ?? string.Empty,
                TotalAmount = 0 // Will be calculated from order lines
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Add order lines if provided
            if (orderDto.OrderLines != null && orderDto.OrderLines.Any())
            {
                decimal totalAmount = 0;
                foreach (var lineDto in orderDto.OrderLines)
                {
                    // Verify product exists
                    var product = await _context.Products.FindAsync(lineDto.ProductId);
                    if (product == null)
                    {
                        return BadRequest($"Product with ID {lineDto.ProductId} not found");
                    }

                    var orderLine = new OrderLine
                    {
                        OrderId = order.Id,
                        ProductId = lineDto.ProductId,
                        Quantity = lineDto.Quantity,
                        UnitPrice = lineDto.UnitPrice ?? product.Price,
                        Discount = lineDto.Discount ?? string.Empty,
                        DiscountAmount = lineDto.DiscountAmount,
                        Notes = lineDto.Notes ?? string.Empty
                    };

                    // Calculate net price
                    orderLine.NetPrice = (orderLine.UnitPrice * orderLine.Quantity) - orderLine.DiscountAmount;
                    totalAmount += orderLine.NetPrice;

                    _context.OrderLines.Add(orderLine);
                }

                order.TotalAmount = totalAmount;
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        // PUT: api/orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, UpdateOrderDto orderDto)
        {
            if (id != orderDto.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            // Verify customer exists if changed
            if (order.CustomerId != orderDto.CustomerId)
            {
                var customer = await _context.Customers.FindAsync(orderDto.CustomerId);
                if (customer == null)
                {
                    return BadRequest("Customer not found");
                }
            }

            order.CustomerId = orderDto.CustomerId;
            order.Status = orderDto.Status;
            order.Notes = orderDto.Notes ?? string.Empty;
            
            if (orderDto.Status == OrderStatus.Completed && order.CompletedDate == null)
            {
                order.CompletedDate = DateTime.UtcNow;
            }
            else if (orderDto.Status != OrderStatus.Completed)
            {
                order.CompletedDate = null;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
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

        // DELETE: api/orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderLines)
                .FirstOrDefaultAsync(o => o.Id == id);
            
            if (order == null)
            {
                return NotFound();
            }

            // Remove all order lines first
            _context.OrderLines.RemoveRange(order.OrderLines);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/orders/customer/5
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByCustomer(int customerId)
        {
            return await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderLines)
                    .ThenInclude(ol => ol.Product)
                        .ThenInclude(p => p.Artist)
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        // GET: api/orders/status/{status}
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByStatus(OrderStatus status)
        {
            return await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderLines)
                    .ThenInclude(ol => ol.Product)
                        .ThenInclude(p => p.Artist)
                .Where(o => o.Status == status)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }
    }

    // DTOs for API requests
    public class CreateOrderDto
    {
        public int CustomerId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public string? Notes { get; set; }
        public List<CreateOrderLineDto>? OrderLines { get; set; }
    }

    public class UpdateOrderDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public OrderStatus Status { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateOrderLineDto
    {
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal? UnitPrice { get; set; }
        public string? Discount { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public string? Notes { get; set; }
    }
}
