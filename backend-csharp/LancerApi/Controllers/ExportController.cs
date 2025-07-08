using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using LancerApi.Services;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly ExportService _exportService;

        public ExportController(ExportService exportService)
        {
            _exportService = exportService;
        }

        [HttpGet]
        public async Task<IActionResult> Export()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var excelBytes = await _exportService.GenerateExportAsync(userId);
                
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "user_data.xlsx");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}
