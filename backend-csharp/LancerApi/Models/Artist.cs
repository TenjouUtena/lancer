using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LancerApi.Models
{
    public class Artist
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Faname { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        
        // User ownership
        public string UserId { get; set; } = string.Empty;
        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }

        public virtual ICollection<ArtistBase> ArtistBases { get; set; } = new List<ArtistBase>();
    }

    public class ArtistBase
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public decimal Price { get; set; }

        public int? ArtistId { get; set; }
        [ForeignKey("ArtistId")]
        public virtual Artist? Artist { get; set; }
        
        // PSD file storage - URLs for backward compatibility
        public string OriginalPsdUrl { get; set; } = string.Empty; // Storage for original PSD
        public string ModifiedPsdUrl { get; set; } = string.Empty; // Storage for modified PSD
        
        // PSD file metadata
        public string OriginalPsdFileName { get; set; } = string.Empty;
        public long OriginalPsdFileSize { get; set; }
        public string ModifiedPsdFileName { get; set; } = string.Empty;
        public long ModifiedPsdFileSize { get; set; }
        
        // User ownership
        public string UserId { get; set; } = string.Empty;
        [ForeignKey("UserId")]
        [JsonIgnore]
        public virtual User? User { get; set; }

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
        [JsonIgnore]
        public ArtistBase ArtistBase { get; set; } = null!;
        public int TagId { get; set; }
        [ForeignKey("TagId")]
        public ArtistBaseTagSet Tag { get; set; } = null!;
    }
}
