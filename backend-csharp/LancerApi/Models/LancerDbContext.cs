using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace LancerApi.Models
{
    public class LancerDbContext : IdentityDbContext<User>
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
            
            // Configure user relationships
            modelBuilder.Entity<Artist>()
                .HasOne(a => a.User)
                .WithMany(u => u.Artists)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ArtistBase>()
                .HasOne(ab => ab.User)
                .WithMany(u => u.ArtistBases)
                .HasForeignKey(ab => ab.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Customer>()
                .HasOne(c => c.User)
                .WithMany(u => u.Customers)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.User)
                .WithMany(u => u.Products)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
