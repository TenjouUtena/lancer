using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LancerApi.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int ArtistId { get; set; }
        [ForeignKey("ArtistId")]
        public Artist Artist { get; set; } = null!;
        public int AdId { get; set; }
        [ForeignKey("AdId")]
        public Image Ad { get; set; } = null!;
        public decimal Price { get; set; }
    }
}
