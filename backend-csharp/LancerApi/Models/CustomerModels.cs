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
        
        // Platform-based contact details
        public string DiscordName { get; set; } = string.Empty;
        public string DiscordLink { get; set; } = string.Empty;
        public string FurAffinityName { get; set; } = string.Empty;
        public string FurAffinityLink { get; set; } = string.Empty;
        public string TwitterName { get; set; } = string.Empty;
        public string TwitterLink { get; set; } = string.Empty;
        public string InstagramName { get; set; } = string.Empty;
        public string InstagramLink { get; set; } = string.Empty;
        public string TelegramName { get; set; } = string.Empty;
        public string TelegramLink { get; set; } = string.Empty;
        public string OtherPlatformName { get; set; } = string.Empty;
        public string OtherPlatformLink { get; set; } = string.Empty;
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
