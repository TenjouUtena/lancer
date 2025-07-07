using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LancerApi.Models
{
    public enum OrderStatus
    {
        Pending,
        InProgress,
        Completed,
        Cancelled,
        Refunded
    }

    public class Order
    {
        [Key]
        public int Id { get; set; }
        public int CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; } = null!;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedDate { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public string Notes { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public virtual ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();
    }

    public class OrderLine
    {
        [Key]
        public int Id { get; set; }
        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;
        public int OrderId { get; set; }
        [ForeignKey("OrderId")]
        public Order Order { get; set; } = null!;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public string Discount { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; } = 0;
        public decimal NetPrice { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}
