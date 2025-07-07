using System.ComponentModel.DataAnnotations;

namespace LancerApi.Models
{
    public class ContactType
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
