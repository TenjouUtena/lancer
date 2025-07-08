using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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
        public int? CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public Customer? Customer { get; set; }
        
        public int? CommissionId { get; set; }
        [ForeignKey("CommissionId")]
        public Commission? Commission { get; set; }
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedDate { get; set; }
        
        // New fields from data dictionary
        public DateTime DateStarted { get; set; } = DateTime.UtcNow;
        public DateTime DateDue { get; set; } = DateTime.UtcNow.AddDays(21); // Auto-populate +21 days
        
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public string Notes { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        
        // Payment and posting tracking
        public bool Paid { get; set; } = false;
        public bool Posted { get; set; } = false;
        
        // Discounts and upcharges
        public string DiscountsAndUpcharges { get; set; } = string.Empty; // Dropdown or text field
        
        public virtual ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();
        
        // User ownership
        public string UserId { get; set; } = string.Empty;
        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }
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
