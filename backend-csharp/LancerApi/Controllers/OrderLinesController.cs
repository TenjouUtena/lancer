using LancerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderLinesController : ControllerBase
    {
        private readonly LancerDbContext _context;

        public OrderLinesController(LancerDbContext context)
        {
            _context = context;
        }

        // GET: api/orderlines
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderLine>>> GetOrderLines()
        {
            return await _context.OrderLines
                .Include(ol => ol.Product)
                    .ThenInclude(p => p.Artist)
                .Include(ol => ol.Product)
                    .ThenInclude(p => p.Base)
                .Include(ol => ol.Order)
                    .ThenInclude(o => o.Customer)
                .ToListAsync();
        }

        // GET: api/orderlines/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderLine>> GetOrderLine(int id)
        {
            var orderLine = await _context.OrderLines
                .Include(ol => ol.Product)
                    .ThenInclude(p => p.Artist)
                .Include(ol => ol.Product)
                    .ThenInclude(p => p.Base)
                .Include(ol => ol.Order)
                    .ThenInclude(o => o.Customer)
                .FirstOrDefaultAsync(ol => ol.Id == id);

            if (orderLine == null)
            {
                return NotFound();
            }

            return orderLine;
        }

        // GET: api/orderlines/order/5
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<OrderLine>>> GetOrderLinesByOrder(int orderId)
        {
            return await _context.OrderLines
                .Include(ol => ol.Product)
                    .ThenInclude(p => p.Artist)
                .Include(ol => ol.Product)
                    .ThenInclude(p => p.Base)
                .Where(ol => ol.OrderId == orderId)
                .ToListAsync();
        }

        // POST: api/orderlines
        [HttpPost]
        public async Task<ActionResult<OrderLine>> CreateOrderLine(CreateOrderLineDto orderLineDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verify order exists
            var order = await _context.Orders.FindAsync(orderLineDto.OrderId);
            if (order == null)
            {
                return BadRequest("Order not found");
            }

            // Verify product exists
            var product = await _context.Products.FindAsync(orderLineDto.ProductId);
            if (product == null)
            {
                return BadRequest("Product not found");
            }

            var orderLine = new OrderLine
            {
                OrderId = orderLineDto.OrderId,
                ProductId = orderLineDto.ProductId,
                Quantity = orderLineDto.Quantity,
                UnitPrice = orderLineDto.UnitPrice ?? product.Price,
                Discount = orderLineDto.Discount ?? string.Empty,
                DiscountAmount = orderLineDto.DiscountAmount,
                Notes = orderLineDto.Notes ?? string.Empty
            };

            // Calculate net price
            orderLine.NetPrice = (orderLine.UnitPrice * orderLine.Quantity) - orderLine.DiscountAmount;

            _context.OrderLines.Add(orderLine);
            await _context.SaveChangesAsync();

            // Update order total
            await UpdateOrderTotal(orderLineDto.OrderId);

            return CreatedAtAction(nameof(GetOrderLine), new { id = orderLine.Id }, orderLine);
        }

        // PUT: api/orderlines/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderLine(int id, UpdateOrderLineDto orderLineDto)
        {
            if (id != orderLineDto.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var orderLine = await _context.OrderLines.FindAsync(id);
            if (orderLine == null)
            {
                return NotFound();
            }

            // Verify product exists if changed
            if (orderLine.ProductId != orderLineDto.ProductId)
            {
                var product = await _context.Products.FindAsync(orderLineDto.ProductId);
                if (product == null)
                {
                    return BadRequest("Product not found");
                }
                orderLine.UnitPrice = orderLineDto.UnitPrice ?? product.Price;
            }
            else if (orderLineDto.UnitPrice.HasValue)
            {
                orderLine.UnitPrice = orderLineDto.UnitPrice.Value;
            }

            orderLine.ProductId = orderLineDto.ProductId;
            orderLine.Quantity = orderLineDto.Quantity;
            orderLine.Discount = orderLineDto.Discount ?? string.Empty;
            orderLine.DiscountAmount = orderLineDto.DiscountAmount;
            orderLine.Notes = orderLineDto.Notes ?? string.Empty;

            // Recalculate net price
            orderLine.NetPrice = (orderLine.UnitPrice * orderLine.Quantity) - orderLine.DiscountAmount;

            try
            {
                await _context.SaveChangesAsync();
                
                // Update order total
                await UpdateOrderTotal(orderLine.OrderId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderLineExists(id))
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

        // DELETE: api/orderlines/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderLine(int id)
        {
            var orderLine = await _context.OrderLines.FindAsync(id);
            if (orderLine == null)
            {
                return NotFound();
            }

            var orderId = orderLine.OrderId;

            _context.OrderLines.Remove(orderLine);
            await _context.SaveChangesAsync();

            // Update order total
            await UpdateOrderTotal(orderId);

            return NoContent();
        }

        private async Task UpdateOrderTotal(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order != null)
            {
                var totalAmount = await _context.OrderLines
                    .Where(ol => ol.OrderId == orderId)
                    .SumAsync(ol => ol.NetPrice);

                order.TotalAmount = totalAmount;
                await _context.SaveChangesAsync();
            }
        }

        private bool OrderLineExists(int id)
        {
            return _context.OrderLines.Any(e => e.Id == id);
        }
    }

    public class UpdateOrderLineDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal? UnitPrice { get; set; }
        public string? Discount { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public string? Notes { get; set; }
    }
}