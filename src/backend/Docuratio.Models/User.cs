using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Docuratio.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = "";

    [BsonElement("microsoftId")]
    public string MicrosoftId { get; set; } = "";

    [BsonElement("email")]
    public string Email { get; set; } = "";

    [BsonElement("name")]
    public string Name { get; set; } = "";

    [BsonElement("givenName")]
    public string GivenName { get; set; } = "";

    [BsonElement("surname")]
    public string Surname { get; set; } = "";

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("lastLoginAt")]
    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
}