using MongoDB.Driver;
using Docuratio.Models;

namespace Docuratio.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IMongoClient mongoClient, string databaseName = "docuratio")
    {
        _database = mongoClient.GetDatabase(databaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Document> Documents => _database.GetCollection<Document>("documents");
    public IMongoCollection<RefreshToken> RefreshTokens => _database.GetCollection<RefreshToken>("refreshTokens");
}