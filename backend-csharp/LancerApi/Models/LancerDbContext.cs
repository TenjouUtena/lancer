using Microsoft.EntityFrameworkCore;

namespace LancerApi.Models
{
    public class LancerDbContext : DbContext
    {
        public LancerDbContext(DbContextOptions<LancerDbContext> options) : base(options) { }

        public DbSet<ContactType> ContactTypes { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Artist> Artists { get; set; }
        public DbSet<ArtistBase> ArtistBases { get; set; }
        public DbSet<ArtistBaseTagSet> ArtistBaseTagSets { get; set; }
        public DbSet<ArtistBaseTag> ArtistBaseTags { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<CustomerImage> CustomerImages { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderLine> OrderLines { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
