using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

// Add MongoDB database with host port mapping
var mongodb = builder.AddMongoDB("mongodb")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithMongoExpress()
    .PublishAsConnectionString();

var docuratioDb = mongodb.AddDatabase("docuratio");

// Add the API service
var apiService = builder.AddProject<Projects.Docuratio_Api>("docuratio-api")
    .WithReference(docuratioDb);

builder.Build().Run();
