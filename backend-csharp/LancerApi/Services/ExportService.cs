using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using LancerApi.Models;

namespace LancerApi.Services
{
    public class ExportService
    {
        private readonly LancerDbContext _context;

        public ExportService(LancerDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> GenerateExportAsync(string userId)
        {
            using var package = new ExcelPackage();
            
            // Artists sheet
            var artistsSheet = package.Workbook.Worksheets.Add("Artists");
            var artists = await _context.Artists
                .Where(a => a.UserId == userId)
                .ToListAsync();
            
            // Add headers
            artistsSheet.Cells[1, 1].Value = "Id";
            artistsSheet.Cells[1, 2].Value = "Name";
            artistsSheet.Cells[1, 3].Value = "Faname";
            artistsSheet.Cells[1, 4].Value = "Platform";
            
            int row = 2;
            foreach (var artist in artists)
            {
                artistsSheet.Cells[row, 1].Value = artist.Id;
                artistsSheet.Cells[row, 2].Value = artist.Name;
                artistsSheet.Cells[row, 3].Value = artist.Faname;
                artistsSheet.Cells[row, 4].Value = artist.Platform;
                row++;
            }
            
            // ArtistBases with tags
            var artistBasesSheet = package.Workbook.Worksheets.Add("ArtistBases");
            var artistBases = await _context.ArtistBases
                .Include(ab => ab.Tags)
                .ThenInclude(t => t.Tag)
                .Where(ab => ab.UserId == userId)
                .ToListAsync();
            
            artistBasesSheet.Cells[1, 1].Value = "Id";
            artistBasesSheet.Cells[1, 2].Value = "Name";
            artistBasesSheet.Cells[1, 3].Value = "Url";
            artistBasesSheet.Cells[1, 4].Value = "Price";
            artistBasesSheet.Cells[1, 5].Value = "Tags";
            
            row = 2;
            foreach (var ab in artistBases)
            {
                artistBasesSheet.Cells[row, 1].Value = ab.Id;
                artistBasesSheet.Cells[row, 2].Value = ab.Name;
                artistBasesSheet.Cells[row, 3].Value = ab.Url;
                artistBasesSheet.Cells[row, 4].Value = ab.Price;
                var tags = string.Join(", ", ab.Tags.Select(t => t.Tag.Name));
                artistBasesSheet.Cells[row, 5].Value = tags;
                row++;
            }
            
            // Customers
            var customersSheet = package.Workbook.Worksheets.Add("Customers");
            var customers = await _context.Customers
                .Where(c => c.UserId == userId)
                .ToListAsync();
            
            customersSheet.Cells[1, 1].Value = "Id";
            customersSheet.Cells[1, 2].Value = "Name";
            customersSheet.Cells[1, 3].Value = "Email";
            customersSheet.Cells[1, 4].Value = "Discord";
            customersSheet.Cells[1, 5].Value = "FurAffinity";
            
            row = 2;
            foreach (var customer in customers)
            {
                customersSheet.Cells[row, 1].Value = customer.Id;
                customersSheet.Cells[row, 2].Value = customer.Name;
                customersSheet.Cells[row, 3].Value = customer.EmailAddress;
                customersSheet.Cells[row, 4].Value = customer.DiscordName;
                customersSheet.Cells[row, 5].Value = customer.FurAffinityName;
                row++;
            }
            
            // Products
            var productsSheet = package.Workbook.Worksheets.Add("Products");
            var products = await _context.Products
                .Where(p => p.UserId == userId)
                .ToListAsync();
            
            productsSheet.Cells[1, 1].Value = "Id";
            productsSheet.Cells[1, 2].Value = "Name";
            productsSheet.Cells[1, 3].Value = "Description";
            productsSheet.Cells[1, 4].Value = "Price";
            productsSheet.Cells[1, 5].Value = "Available";
            
            row = 2;
            foreach (var product in products)
            {
                productsSheet.Cells[row, 1].Value = product.Id;
                productsSheet.Cells[row, 2].Value = product.Name;
                productsSheet.Cells[row, 3].Value = product.Description;
                productsSheet.Cells[row, 4].Value = product.Price;
                productsSheet.Cells[row, 5].Value = product.IsAvailable;
                row++;
            }
            
            // Orders
            var ordersSheet = package.Workbook.Worksheets.Add("Orders");
            var orders = await _context.Orders
                .Include(o => o.OrderLines)
                .Where(o => o.UserId == userId)
                .ToListAsync();
            
            ordersSheet.Cells[1, 1].Value = "Id";
            ordersSheet.Cells[1, 2].Value = "Date";
            ordersSheet.Cells[1, 3].Value = "Total";
            ordersSheet.Cells[1, 4].Value = "Status";
            ordersSheet.Cells[1, 5].Value = "Customer";
            
            row = 2;
            foreach (var order in orders)
            {
                ordersSheet.Cells[row, 1].Value = order.Id;
                ordersSheet.Cells[row, 2].Value = order.OrderDate;
                ordersSheet.Cells[row, 3].Value = order.TotalAmount;
                ordersSheet.Cells[row, 4].Value = order.Status;
                ordersSheet.Cells[row, 5].Value = order.Customer?.Name ?? "";
                row++;
            }
            
            // OrderLines
            var orderLinesSheet = package.Workbook.Worksheets.Add("OrderLines");
            var orderLines = await _context.OrderLines
                .Include(ol => ol.Order)
                .Where(ol => ol.Order.UserId == userId)
                .ToListAsync();
            
            orderLinesSheet.Cells[1, 1].Value = "Id";
            orderLinesSheet.Cells[1, 2].Value = "OrderId";
            orderLinesSheet.Cells[1, 3].Value = "Product";
            orderLinesSheet.Cells[1, 4].Value = "Quantity";
            orderLinesSheet.Cells[1, 5].Value = "Price";
            
            row = 2;
            foreach (var ol in orderLines)
            {
                orderLinesSheet.Cells[row, 1].Value = ol.Id;
                orderLinesSheet.Cells[row, 2].Value = ol.OrderId;
                orderLinesSheet.Cells[row, 3].Value = ol.Product?.Name ?? "";
                orderLinesSheet.Cells[row, 4].Value = ol.Quantity;
                orderLinesSheet.Cells[row, 5].Value = ol.UnitPrice;
                row++;
            }
            
            // Save to byte array
            return package.GetAsByteArray();
        }
    }
}
