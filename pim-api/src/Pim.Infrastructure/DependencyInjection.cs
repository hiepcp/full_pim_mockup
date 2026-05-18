using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Pim.Application.Interfaces.Repositories;
using Pim.Infrastructure.Repositories;

namespace Pim.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddScoped<IProductRepository, SqlProductRepository>(_ => new SqlProductRepository(connectionString));
        services.AddScoped<IVisualAssetRepository, SqlVisualAssetRepository>(_ => new SqlVisualAssetRepository(connectionString));
        services.AddScoped<ITextContentRepository, SqlTextContentRepository>(_ => new SqlTextContentRepository(connectionString));
        services.AddScoped<IProductDocumentRepository, SqlProductDocumentRepository>(_ => new SqlProductDocumentRepository(connectionString));
        return services;
    }
}
