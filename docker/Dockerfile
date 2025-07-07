# Multi-stage Docker build for Lancer .NET API

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["backend-csharp/LancerApi/LancerApi.csproj", "LancerApi/"]
RUN dotnet restore "LancerApi/LancerApi.csproj"

# Copy source code and build
COPY backend-csharp/ .
WORKDIR "/src/LancerApi"
RUN dotnet build "LancerApi.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "LancerApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Create non-root user for security
RUN groupadd -r lancer && useradd -r -g lancer lancer

# Install postgresql client for health checks and migrations
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=publish /app/publish .

# Set ownership
RUN chown -R lancer:lancer /app

# Switch to non-root user
USER lancer

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/swagger || exit 1

# Entry point
ENTRYPOINT ["dotnet", "LancerApi.dll"]