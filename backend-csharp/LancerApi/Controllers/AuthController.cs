using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LancerApi.Services;
using LancerApi.Models;
using System.Security.Claims;
using Google.Apis.Auth;

namespace LancerApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                // Verify the Google ID token
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new[] { _configuration["Google:ClientId"] }
                };
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
                
                if (payload == null)
                {
                    return BadRequest(new { message = "Invalid Google token" });
                }

                // Get or create user
                var user = await _authService.GetOrCreateUserFromGoogleAsync(
                    payload.Subject,
                    payload.Email,
                    payload.GivenName ?? "",
                    payload.FamilyName ?? ""
                );

                if (user == null)
                {
                    return BadRequest(new { message = "Failed to create user" });
                }

                // Generate JWT token
                var token = await _authService.GenerateJwtTokenAsync(user);

                return Ok(new
                {
                    token = token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        googleId = user.GoogleId
                    }
                });
            }
            catch (InvalidJwtException)
            {
                return BadRequest(new { message = "Invalid Google token" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Authentication failed", error = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                googleId = user.GoogleId
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // For JWT tokens, logout is handled client-side by removing the token
            return Ok(new { message = "Logged out successfully" });
        }
    }

    public class GoogleLoginRequest
    {
        public string IdToken { get; set; } = string.Empty;
    }
}
