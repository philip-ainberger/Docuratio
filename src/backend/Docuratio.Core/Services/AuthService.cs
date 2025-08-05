using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using MongoDB.Bson;
using Docuratio.Data;
using Docuratio.Models;

namespace Docuratio.Core.Services;

public class AuthService
{
    private readonly MongoDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;
    private readonly HttpClient _httpClient;

    public AuthService(MongoDbContext dbContext, IConfiguration configuration, ILogger<AuthService> logger, HttpClient httpClient)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<MicrosoftUserInfo?> ValidateMicrosoftTokenAsync(string accessToken)
    {
        try
        {
            // Call Microsoft Graph API to get user info
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
            
            var response = await _httpClient.GetAsync("https://graph.microsoft.com/v1.0/me");
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Microsoft Graph API call failed with status: {StatusCode}", response.StatusCode);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var userInfo = JsonSerializer.Deserialize<MicrosoftGraphUserResponse>(content, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            if (userInfo == null || string.IsNullOrEmpty(userInfo.Id))
            {
                _logger.LogWarning("Invalid user info received from Microsoft Graph API");
                return null;
            }

            return new MicrosoftUserInfo
            {
                Id = userInfo.Id,
                Email = userInfo.Mail ?? userInfo.UserPrincipalName ?? "",
                Name = userInfo.DisplayName ?? "",
                GivenName = userInfo.GivenName ?? "",
                Surname = userInfo.Surname ?? ""
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating Microsoft token");
            return null;
        }
    }

    public async Task<User> GetOrCreateUserAsync(MicrosoftUserInfo userInfo)
    {
        try
        {
            var filter = Builders<User>.Filter.Eq(u => u.MicrosoftId, userInfo.Id);
            var existingUser = await _dbContext.Users.Find(filter).FirstOrDefaultAsync();

            if (existingUser != null)
            {
                // Update user info if changed
                var updateDefinition = Builders<User>.Update
                    .Set(u => u.Email, userInfo.Email)
                    .Set(u => u.Name, userInfo.Name)
                    .Set(u => u.GivenName, userInfo.GivenName)
                    .Set(u => u.Surname, userInfo.Surname)
                    .Set(u => u.UpdatedAt, DateTime.UtcNow);

                await _dbContext.Users.UpdateOneAsync(filter, updateDefinition);
                
                existingUser.Email = userInfo.Email;
                existingUser.Name = userInfo.Name;
                existingUser.GivenName = userInfo.GivenName;
                existingUser.Surname = userInfo.Surname;
                existingUser.UpdatedAt = DateTime.UtcNow;
                
                return existingUser;
            }

            // Create new user
            var newUser = new User
            {
                Id = ObjectId.GenerateNewId().ToString(),
                MicrosoftId = userInfo.Id,
                Email = userInfo.Email,
                Name = userInfo.Name,
                GivenName = userInfo.GivenName,
                Surname = userInfo.Surname,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _dbContext.Users.InsertOneAsync(newUser);
            return newUser;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating or retrieving user for Microsoft ID: {MicrosoftId}", userInfo.Id);
            throw;
        }
    }

    public string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["SecretKey"];
        
        if (string.IsNullOrEmpty(secretKey))
        {
            throw new InvalidOperationException("JWT SecretKey is not configured");
        }

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Name, user.Name),
            new("given_name", user.GivenName ?? ""),
            new("family_name", user.Surname ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new("microsoft_id", user.MicrosoftId)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    public async Task<RefreshToken> StoreRefreshTokenAsync(string userId, string token)
    {
        var refreshToken = new RefreshToken
        {
            Id = ObjectId.GenerateNewId().ToString(),
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7), // 7 days
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.RefreshTokens.InsertOneAsync(refreshToken);
        return refreshToken;
    }

    public async Task<RefreshToken?> ValidateRefreshTokenAsync(string token)
    {
        var filter = Builders<RefreshToken>.Filter.And(
            Builders<RefreshToken>.Filter.Eq(rt => rt.Token, token),
            Builders<RefreshToken>.Filter.Gt(rt => rt.ExpiresAt, DateTime.UtcNow)
        );

        return await _dbContext.RefreshTokens.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<User?> GetUserByIdAsync(string userId)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
        return await _dbContext.Users.Find(filter).FirstOrDefaultAsync();
    }

    public async Task InvalidateRefreshTokensAsync(string userId)
    {
        var filter = Builders<RefreshToken>.Filter.Eq(rt => rt.UserId, userId);
        await _dbContext.RefreshTokens.DeleteManyAsync(filter);
    }

    public async Task InvalidateRefreshTokenAsync(string token)
    {
        var filter = Builders<RefreshToken>.Filter.Eq(rt => rt.Token, token);
        await _dbContext.RefreshTokens.DeleteOneAsync(filter);
    }
}

public class MicrosoftUserInfo
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string Name { get; set; } = "";
    public string GivenName { get; set; } = "";
    public string Surname { get; set; } = "";
}

public class MicrosoftGraphUserResponse
{
    public string Id { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string Mail { get; set; } = "";
    public string UserPrincipalName { get; set; } = "";
    public string GivenName { get; set; } = "";
    public string Surname { get; set; } = "";
}