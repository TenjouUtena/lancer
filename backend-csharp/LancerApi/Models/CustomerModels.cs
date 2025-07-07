using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LancerApi.Models
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        public string FaUser { get; set; } = string.Empty;
        public string FaLink { get; set; } = string.Empty;
        public string Discord { get; set; } = string.Empty;
        public string Telegram { get; set; } = string.Empty;
    }

    public class CustomerImage
    {
        [Key]
        public int Id { get; set; }
        public int ImageId { get; set; }
        [ForeignKey("ImageId")]
        public Image Image { get; set; } = null!;
        public int CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; } = null!;
    }
}
