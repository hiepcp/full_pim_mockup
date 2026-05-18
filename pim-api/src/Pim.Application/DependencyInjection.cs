using Microsoft.Extensions.DependencyInjection;
using Pim.Application.Interfaces.Services;
using Pim.Application.Services;

namespace Pim.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IVisualAssetService, VisualAssetService>();
        services.AddScoped<ITextContentService, TextContentService>();
        services.AddScoped<IProductDocumentService, ProductDocumentService>();
        return services;
    }
}
