using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LancerApi.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ArtistId { get; set; }
        [ForeignKey("ArtistId")]
        public Artist Artist { get; set; } = null!;
        public int? BaseId { get; set; }
        [ForeignKey("BaseId")]
        public ArtistBase? Base { get; set; }
        public int AdId { get; set; }
        [ForeignKey("AdId")]
        public Image Ad { get; set; } = null!;
        public decimal Price { get; set; }
        public bool IsAvailable { get; set; } = true;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
    }
}
