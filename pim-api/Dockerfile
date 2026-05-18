FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY src/Pim.Domain/Pim.Domain.csproj src/Pim.Domain/
COPY src/Pim.Application/Pim.Application.csproj src/Pim.Application/
COPY src/Pim.Infrastructure/Pim.Infrastructure.csproj src/Pim.Infrastructure/
COPY src/Pim.Api/Pim.Api.csproj src/Pim.Api/
RUN dotnet restore src/Pim.Api/Pim.Api.csproj

# Copy everything and build
COPY src/ src/
RUN dotnet publish src/Pim.Api/Pim.Api.csproj -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Pim.Api.dll"]
