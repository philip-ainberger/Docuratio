using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Docuratio.Models;

public class Document
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = "";

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = "";

    [BsonElement("fileName")]
    public string FileName { get; set; } = "";

    [BsonElement("originalName")]
    public string OriginalName { get; set; } = "";

    [BsonElement("contentType")]
    public string ContentType { get; set; } = "";

    [BsonElement("fileSize")]
    public long FileSize { get; set; }

    [BsonElement("filePath")]
    public string FilePath { get; set; } = "";

    [BsonElement("metadata")]
    public DocumentMetadata Metadata { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class DocumentMetadata
{
    [BsonElement("title")]
    public string Title { get; set; } = "";

    [BsonElement("description")]
    public string Description { get; set; } = "";

    [BsonElement("tags")]
    public string[] Tags { get; set; } = Array.Empty<string>();
}