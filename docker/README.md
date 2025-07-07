# Lancer Docker Setup

This directory contains Docker configuration for the Lancer application, supporting both local development and production deployment.

## Architecture

- **API**: .NET 9.0 application in Docker container
- **Frontend**: Next.js application with optimized production build
- **Database**: PostgreSQL with initialization scripts
- **Caching**: Redis (optional)
- **Reverse Proxy**: Nginx for production
- **Development Tools**: pgAdmin for database management

## Quick Start

### Local Development

1. **Start all services**
   ```bash
   cd docker
   docker-compose up -d
   ```

2. **Access applications**
   - Frontend: http://localhost:3000
   - API: http://localhost:5223
   - API Docs: http://localhost:5223/swagger
   - pgAdmin: http://localhost:8080 (dev profile)

3. **View logs**
   ```bash
   docker-compose logs -f api
   docker-compose logs -f frontend
   ```

4. **Stop services**
   ```bash
   docker-compose down
   ```

### Production Deployment

1. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Container Details

### API Container (`Dockerfile`)
- **Base Image**: `mcr.microsoft.com/dotnet/aspnet:9.0`
- **Build**: Multi-stage build for optimized size
- **Security**: Non-root user, minimal surface area
- **Health Check**: Swagger endpoint monitoring
- **Port**: 8080

### Frontend Container (`Dockerfile.frontend`)
- **Base Image**: `node:18-alpine`
- **Build**: Multi-stage with standalone output
- **Optimization**: Static asset optimization
- **Health Check**: Application root endpoint
- **Port**: 3000

## Build Scripts

### `build-and-push.sh`
Automated script for building and pushing images to AWS ECR.

```bash
# Build for development
./build-and-push.sh dev

# Build for production
./build-and-push.sh prod

# Build for staging
./build-and-push.sh staging
```

Features:
- ECR authentication
- Multi-tag support (latest, environment, git hash, timestamp)
- Image cleanup
- ECS service updates
- Prerequisites checking

## Environment Configuration

### Development (`.env.dev`)
```env
ENVIRONMENT=dev
DATABASE_CONNECTION_STRING=Host=postgres;Port=5432;Database=lancer;Username=lanceruser;Password=lancerpass123
API_URL=http://localhost:5223/api/
FRONTEND_URL=http://localhost:3000
```

### Production (`.env.prod`)
```env
ENVIRONMENT=prod
DATABASE_CONNECTION_STRING=Host=your-rds-endpoint;Port=5432;Database=lancer;Username=lanceruser;Password=your-secure-password
API_URL=https://api.yourdomain.com/api/
FRONTEND_URL=https://yourdomain.com
S3_BUCKET_NAME=your-s3-bucket
```

## Database Setup

### Local Development
- PostgreSQL runs in container
- Initial setup via `init-db.sql`
- Persistent data in Docker volume
- pgAdmin for management

### Production
- Uses AWS RDS PostgreSQL
- Connection via environment variables
- Entity Framework migrations
- Automated backups

## Development Workflow

### 1. Code Changes
```bash
# API changes - rebuild container
docker-compose build api
docker-compose up -d api

# Frontend changes - hot reload (development)
# Changes are automatically detected via volume mounts
```

### 2. Database Migrations
```bash
# Run migrations in API container
docker-compose exec api dotnet ef database update

# Or run locally
cd backend-csharp/LancerApi
dotnet ef database update
```

### 3. Debugging
```bash
# API logs
docker-compose logs -f api

# Database access
docker-compose exec postgres psql -U lanceruser -d lancer

# Container shell access
docker-compose exec api bash
docker-compose exec frontend sh
```

## Production Considerations

### Security
- Non-root containers
- Secrets via environment variables
- Network isolation
- SSL/TLS termination at load balancer

### Performance
- Multi-stage builds for minimal image size
- Resource limits and reservations
- Health checks and restart policies
- Nginx reverse proxy for static assets

### Monitoring
- Container health checks
- Application logging to stdout
- CloudWatch integration (AWS)
- Prometheus metrics (optional)

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   sudo lsof -i :3000
   sudo lsof -i :5223
   
   # Modify ports in docker-compose.yml
   ```

2. **Database Connection**
   ```bash
   # Check database status
   docker-compose ps postgres
   
   # Test connection
   docker-compose exec postgres psql -U lanceruser -d lancer -c "SELECT 1;"
   ```

3. **Build Failures**
   ```bash
   # Clean build cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Memory Issues**
   ```bash
   # Check container resources
   docker stats
   
   # Increase Docker memory limit
   # Docker Desktop -> Preferences -> Resources
   ```

### Useful Commands

```bash
# View all containers
docker-compose ps

# Follow logs for all services
docker-compose logs -f

# Restart specific service
docker-compose restart api

# Execute command in container
docker-compose exec api bash

# View container resource usage
docker stats

# Clean up containers and volumes
docker-compose down -v
docker system prune -a
```

## AWS ECR Integration

### Setup
1. Terraform creates ECR repository
2. Build script authenticates with ECR
3. Images pushed with multiple tags

### Usage
```bash
# Push to ECR
./build-and-push.sh prod

# Pull from ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker pull your-account.dkr.ecr.us-east-1.amazonaws.com/lancer-api:latest
```

## Performance Optimization

### Image Size
- Multi-stage builds
- Alpine base images where possible
- .dockerignore files
- Layer caching optimization

### Runtime Performance
- Resource limits
- Health checks
- Graceful shutdowns
- Connection pooling

### Caching
- Docker layer caching
- Application-level caching with Redis
- Static asset caching with Nginx

## Support

For Docker-specific issues:
1. Check container logs: `docker-compose logs`
2. Verify resource usage: `docker stats`
3. Test connectivity: `docker-compose exec api ping postgres`
4. Review Docker documentation
5. Check application health endpoints