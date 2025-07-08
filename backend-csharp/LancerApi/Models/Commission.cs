using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LancerApi.Models
{
    public enum CommissionType
    {
        Digital,
        Traditional,
        Animation,
        Reference,
        Icon,
        Custom
    }

    public class Commission
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public CommissionType Type { get; set; }
        public int Slots { get; set; } = 1;
        
        // Base creator and base name relationships
        public int? BaseCreatorId { get; set; }
        [ForeignKey("BaseCreatorId")]
        public virtual Artist? BaseCreator { get; set; }
        
        public int? ArtistBaseId { get; set; }
        [ForeignKey("ArtistBaseId")]
        public virtual ArtistBase? ArtistBase { get; set; }
        
        // Advertisement image
        public string AdvertImageUrl { get; set; } = string.Empty;
        
        // User ownership
        public string UserId { get; set; } = string.Empty;
        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }
        
        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}