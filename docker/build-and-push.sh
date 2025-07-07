#!/bin/bash

# Build and push Docker images to AWS ECR
# Usage: ./build-and-push.sh [environment]

set -e

# Configuration
ENVIRONMENT=${1:-dev}
PROJECT_NAME="lancer"
AWS_REGION=${AWS_REGION:-us-east-1}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install it first."
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Run 'aws configure' first."
    fi
    
    log "Prerequisites check passed"
}

# Get ECR repository URI
get_ecr_uri() {
    log "Getting ECR repository URI..."
    
    ECR_URI=$(aws ecr describe-repositories \
        --repository-names "${PROJECT_NAME}-api" \
        --region "${AWS_REGION}" \
        --query 'repositories[0].repositoryUri' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$ECR_URI" ] || [ "$ECR_URI" = "None" ]; then
        error "ECR repository '${PROJECT_NAME}-api' not found. Please run Terraform first."
    fi
    
    log "ECR repository URI: $ECR_URI"
}

# Login to ECR
ecr_login() {
    log "Logging in to ECR..."
    
    aws ecr get-login-password --region "${AWS_REGION}" | \
        docker login --username AWS --password-stdin "${ECR_URI%%/*}"
    
    log "Successfully logged in to ECR"
}

# Build API image
build_api_image() {
    log "Building API Docker image..."
    
    # Get git commit hash for tagging
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    TIMESTAMP=$(date +%Y%m%d%H%M%S)
    
    # Build image
    docker build \
        -f Dockerfile \
        -t "${PROJECT_NAME}-api:latest" \
        -t "${PROJECT_NAME}-api:${ENVIRONMENT}" \
        -t "${PROJECT_NAME}-api:${GIT_COMMIT}" \
        -t "${PROJECT_NAME}-api:${TIMESTAMP}" \
        ..
    
    log "API image built successfully"
}

# Tag and push API image
push_api_image() {
    log "Tagging and pushing API image to ECR..."
    
    # Tag images for ECR
    docker tag "${PROJECT_NAME}-api:latest" "${ECR_URI}:latest"
    docker tag "${PROJECT_NAME}-api:${ENVIRONMENT}" "${ECR_URI}:${ENVIRONMENT}"
    docker tag "${PROJECT_NAME}-api:${GIT_COMMIT}" "${ECR_URI}:${GIT_COMMIT}"
    docker tag "${PROJECT_NAME}-api:${TIMESTAMP}" "${ECR_URI}:${TIMESTAMP}"
    
    # Push images
    docker push "${ECR_URI}:latest"
    docker push "${ECR_URI}:${ENVIRONMENT}"
    docker push "${ECR_URI}:${GIT_COMMIT}"
    docker push "${ECR_URI}:${TIMESTAMP}"
    
    log "API image pushed successfully"
}

# Build frontend image (for local testing)
build_frontend_image() {
    log "Building frontend Docker image..."
    
    # Get API URL for the environment
    if [ "$ENVIRONMENT" = "prod" ]; then
        API_URL="https://api.yourdomain.com/api/"
    else
        API_URL="http://localhost:5223/api/"
    fi
    
    docker build \
        -f Dockerfile.frontend \
        --build-arg NEXT_PUBLIC_API_URL="$API_URL" \
        -t "${PROJECT_NAME}-frontend:latest" \
        -t "${PROJECT_NAME}-frontend:${ENVIRONMENT}" \
        ..
    
    log "Frontend image built successfully"
}

# Clean up old images
cleanup_images() {
    log "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old tagged images (keep last 5)
    docker images "${PROJECT_NAME}-api" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +2 | sort -k2 -r | tail -n +6 | awk '{print $1}' | \
        xargs -r docker rmi 2>/dev/null || true
    
    log "Cleanup completed"
}

# Update ECS service
update_ecs_service() {
    log "Updating ECS service..."
    
    CLUSTER_NAME="${PROJECT_NAME}-cluster"
    SERVICE_NAME="${PROJECT_NAME}-api-service"
    
    # Check if service exists
    if aws ecs describe-services \
        --cluster "$CLUSTER_NAME" \
        --services "$SERVICE_NAME" \
        --region "$AWS_REGION" \
        --query 'services[0].serviceName' \
        --output text 2>/dev/null | grep -q "$SERVICE_NAME"; then
        
        # Force new deployment
        aws ecs update-service \
            --cluster "$CLUSTER_NAME" \
            --service "$SERVICE_NAME" \
            --force-new-deployment \
            --region "$AWS_REGION" > /dev/null
        
        log "ECS service update initiated"
        log "Monitor deployment: aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION"
    else
        warn "ECS service '$SERVICE_NAME' not found. Deploy with Terraform first."
    fi
}

# Main execution
main() {
    log "Starting Docker build and push process for environment: $ENVIRONMENT"
    
    # Change to docker directory
    cd "$(dirname "$0")"
    
    check_prerequisites
    get_ecr_uri
    ecr_login
    build_api_image
    push_api_image
    
    if [ "$ENVIRONMENT" = "dev" ]; then
        build_frontend_image
    fi
    
    cleanup_images
    
    if [ "$ENVIRONMENT" != "dev" ]; then
        update_ecs_service
    fi
    
    log "Build and push completed successfully!"
    log "API image: ${ECR_URI}:${ENVIRONMENT}"
    
    if [ "$ENVIRONMENT" = "dev" ]; then
        log "Frontend image: ${PROJECT_NAME}-frontend:${ENVIRONMENT}"
        log ""
        log "To run locally:"
        log "  docker-compose up -d"
        log ""
        log "To run in production mode:"
        log "  docker-compose -f docker-compose.prod.yml up -d"
    fi
}

# Run main function
main "$@"