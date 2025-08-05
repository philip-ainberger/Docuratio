using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Docuratio.Core.Services;

namespace Docuratio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("microsoft")]
    public async Task<IActionResult> AuthenticateWithMicrosoft([FromBody] MicrosoftTokenRequest request)
    {
        try
        {
            // Validate Microsoft token and get user info
            var userInfo = await _authService.ValidateMicrosoftTokenAsync(request.AccessToken);
            
            if (userInfo == null)
            {
                return Unauthorized(new { message = "Invalid Microsoft token" });
            }

            // Get or create user in our database
            var user = await _authService.GetOrCreateUserAsync(userInfo);

            // Generate JWT token for our API
            var jwtToken = _authService.GenerateJwtToken(user);
            var refreshTokenString = _authService.GenerateRefreshToken();

            // Store refresh token in database
            var refreshToken = await _authService.StoreRefreshTokenAsync(user.Id, refreshTokenString);

            return Ok(new AuthResponse
            {
                AccessToken = jwtToken,
                RefreshToken = refreshToken.Token,
                ExpiresIn = 3600, // 1 hour
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Microsoft authentication");
            return StatusCode(500, new { message = "Authentication failed" });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            // Validate refresh token from database
            var refreshToken = await _authService.ValidateRefreshTokenAsync(request.RefreshToken);
            
            if (refreshToken == null)
            {
                return Unauthorized(new { message = "Invalid refresh token" });
            }

            // Get user from database
            var user = await _authService.GetUserByIdAsync(refreshToken.UserId);
            
            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            // Generate new JWT token
            var newJwtToken = _authService.GenerateJwtToken(user);
            var newRefreshTokenString = _authService.GenerateRefreshToken();

            // Invalidate old refresh token and store new one
            await _authService.InvalidateRefreshTokenAsync(request.RefreshToken);
            var newRefreshToken = await _authService.StoreRefreshTokenAsync(user.Id, newRefreshTokenString);

            return Ok(new AuthResponse
            {
                AccessToken = newJwtToken,
                RefreshToken = newRefreshToken.Token,
                ExpiresIn = 3600,
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return StatusCode(500, new { message = "Token refresh failed" });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var userId = User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            // Invalidate all refresh tokens for this user
            await _authService.InvalidateRefreshTokensAsync(userId);
            
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, new { message = "Logout failed" });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst("sub")?.Value;
            var email = User.FindFirst("email")?.Value;
            var name = User.FindFirst("name")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            return Ok(new UserInfo
            {
                Id = userId,
                Email = email ?? "",
                Name = name ?? ""
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new { message = "Failed to get user info" });
        }
    }

}

public class MicrosoftTokenRequest
{
    public string AccessToken { get; set; } = "";
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = "";
}

public class AuthResponse
{
    public string AccessToken { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public int ExpiresIn { get; set; }
    public UserInfo? User { get; set; }
}

public class UserInfo
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string Name { get; set; } = "";
}