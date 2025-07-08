using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace LancerApi.Models
{
    public class User : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? GoogleId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties for user-owned entities
        public virtual ICollection<Artist> Artists { get; set; } = new List<Artist>();
        public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
        public virtual ICollection<ArtistBase> ArtistBases { get; set; } = new List<ArtistBase>();
    }
}
