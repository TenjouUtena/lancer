using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LancerApi.Models
{
    public class Artist
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Faname { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
    }

    public class ArtistBase
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public decimal Price { get; set; }
        
        // Navigation property for tags
        public virtual ICollection<ArtistBaseTag> Tags { get; set; } = new List<ArtistBaseTag>();
    }

    public class ArtistBaseTagSet
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class ArtistBaseTag
    {
        [Key]
        public int Id { get; set; }
        public int ArtistBaseId { get; set; }
        [ForeignKey("ArtistBaseId")]
        public ArtistBase ArtistBase { get; set; } = null!;
        public int TagId { get; set; }
        [ForeignKey("TagId")]
        public ArtistBaseTagSet Tag { get; set; } = null!;
    }
}
