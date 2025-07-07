using System.ComponentModel.DataAnnotations;

namespace LancerApi.Models
{
    public class Image
    {
        [Key]
        public int Id { get; set; }
        public string S3Key { get; set; } = string.Empty;
    }
}
