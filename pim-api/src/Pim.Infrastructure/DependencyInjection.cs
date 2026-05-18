using Azure.Storage.Blobs;
using Dapper;
using Hangfire;
using Hangfire.PostgreSql;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Pim.Application.Interfaces.Repositories;
using Pim.Application.Interfaces.Services;
using Pim.Infrastructure.D365;
using Pim.Infrastructure.Repositories;
using StackExchange.Redis;

namespace Pim.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Enable Dapper snake_case → PascalCase mapping
        DefaultTypeMap.MatchNamesWithUnderscores = true;

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        // Repositories (Dapper + PostgreSQL)
        services.AddScoped<IProductRepository, SqlProductRepository>(_ => new SqlProductRepository(connectionString));
        services.AddScoped<IVisualAssetRepository, SqlVisualAssetRepository>(_ => new SqlVisualAssetRepository(connectionString));
        services.AddScoped<ITextContentRepository, SqlTextContentRepository>(_ => new SqlTextContentRepository(connectionString));
        services.AddScoped<IProductDocumentRepository, SqlProductDocumentRepository>(_ => new SqlProductDocumentRepository(connectionString));
        services.AddScoped<IProductVariantRepository, SqlProductVariantRepository>(_ => new SqlProductVariantRepository(connectionString));

        // Redis
        var redisConnection = configuration.GetConnectionString("Redis") ?? "localhost:6379";
        services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnection));

        // Azure Blob Storage
        var blobConnectionString = configuration["AzureBlobStorage:ConnectionString"];
        if (!string.IsNullOrEmpty(blobConnectionString))
        {
            services.AddSingleton(new BlobServiceClient(blobConnectionString));
        }

        // Hangfire (background jobs)
        services.AddHangfire(config =>
            config.UsePostgreSqlStorage(opts =>
                opts.UseNpgsqlConnection(connectionString)));
        services.AddHangfireServer();

        // D365 Integration
        services.Configure<D365Options>(configuration.GetSection(D365Options.SectionName));
        services.AddSingleton<D365TokenService>();
        services.AddHttpClient<D365TokenService>();
        services.AddHttpClient<D365HttpClient>(client =>
        {
            client.Timeout = TimeSpan.FromMinutes(5);
        });
        services.AddScoped<ID365SyncService, D365SyncService>();

        // MassTransit + RabbitMQ
        services.AddMassTransit(x =>
        {
            x.UsingRabbitMq((context, cfg) =>
            {
                var rabbitHost = configuration["RabbitMQ:Host"] ?? "localhost";
                var rabbitPort = int.Parse(configuration["RabbitMQ:Port"] ?? "5672");
                var rabbitUser = configuration["RabbitMQ:Username"] ?? "guest";
                var rabbitPass = configuration["RabbitMQ:Password"] ?? "guest";

                cfg.Host(rabbitHost, (ushort)rabbitPort, "/", h =>
                {
                    h.Username(rabbitUser);
                    h.Password(rabbitPass);
                });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
