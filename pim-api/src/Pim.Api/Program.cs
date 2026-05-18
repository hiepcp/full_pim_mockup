using System.Text.Json;
using Dapper;
using Pim.Api.Middleware;
using Pim.Application;
using Pim.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

DefaultTypeMap.MatchNamesWithUnderscores = true;

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Spa", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5174",
                "https://localhost:5174",
                "http://localhost:3001",
                "https://localhost:3001",
                "http://pim.local.com:5174",
                "https://pim.local.com:5174",
                "http://pim.local.com:3001",
                "https://pim.local.com:3001",
                "https://pim.response.com.vn",
                "https://pim-uat.response.com.vn"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Spa");
app.UseAuthorization();
app.MapControllers();
app.Run();
