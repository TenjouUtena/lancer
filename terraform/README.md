# Lancer Infrastructure

This directory contains Terraform configuration for deploying the Lancer application to AWS.

## Architecture

- **VPC**: Custom VPC with public and private subnets across 2 AZs
- **Database**: RDS PostgreSQL instance in private subnets
- **Container Registry**: ECR repository for the API Docker image
- **Compute**: ECS Fargate cluster for running the API
- **Load Balancer**: Application Load Balancer for high availability
- **Storage**: S3 bucket for file assets
- **Security**: Secrets Manager for database credentials

## Prerequisites

1. **AWS CLI**: Install and configure with appropriate credentials
   ```bash
   aws configure
   ```

2. **Terraform**: Install Terraform >= 1.0
   ```bash
   # macOS
   brew install terraform
   
   # Linux
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

3. **Docker**: Required for building and pushing the API image

## Quick Start

1. **Initialize Terraform**
   ```bash
   cd terraform
   terraform init
   ```

2. **Configure Variables**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your settings
   ```

3. **Plan Deployment**
   ```bash
   terraform plan
   ```

4. **Deploy Infrastructure**
   ```bash
   terraform apply
   ```

## Configuration

### Required Variables

- `aws_region`: AWS region for deployment
- `project_name`: Name prefix for all resources
- `environment`: Environment name (dev/staging/prod)

### Optional Variables

- `vpc_cidr`: VPC CIDR block (default: 10.0.0.0/16)
- `db_instance_class`: RDS instance size (default: db.t3.micro)
- `api_cpu`: CPU units for API containers (default: 256)
- `api_memory`: Memory for API containers (default: 512)
- `domain_name`: Custom domain for the API
- `enable_https`: Enable HTTPS with ACM certificate

## Deployment Process

### 1. Infrastructure Setup
```bash
# Deploy the infrastructure
terraform apply

# Get the ECR repository URL
ECR_REPO=$(terraform output -raw ecr_repository_url)
echo $ECR_REPO
```

### 2. Database Setup
```bash
# Get database connection details
terraform output database_endpoint
terraform output connection_string

# Run database migrations (after building the API image)
```

### 3. API Deployment
```bash
# Build and push Docker image (see ../docker/README.md)
cd ../docker
./build-and-push.sh

# Deploy ECS service
cd ../terraform
terraform apply -target=aws_ecs_service.lancer_api
```

## Resource Costs (Approximate)

### Development Environment
- **RDS (db.t3.micro)**: ~$13/month
- **NAT Gateway**: ~$32/month
- **ECS Fargate**: ~$15/month (1 task)
- **Load Balancer**: ~$16/month
- **S3**: ~$1-5/month
- **Total**: ~$77/month

### Production Environment
- **RDS (db.t3.small)**: ~$26/month
- **NAT Gateway**: ~$32/month (per AZ)
- **ECS Fargate**: ~$30/month (2+ tasks)
- **Load Balancer**: ~$16/month
- **S3**: ~$5-20/month
- **Total**: ~$109+/month

## Security Features

- VPC with private subnets for database
- Security groups restricting access
- Database credentials in AWS Secrets Manager
- S3 bucket with versioning and encryption
- IAM roles with least privilege access

## Monitoring

- CloudWatch logs for application monitoring
- ECS Container Insights enabled
- RDS Performance Insights available

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

⚠️ **Warning**: This will permanently delete all data including the database!

## Troubleshooting

### Common Issues

1. **Insufficient Permissions**
   ```
   Error: AccessDenied
   ```
   Solution: Ensure your AWS credentials have the necessary IAM permissions.

2. **Resource Limits**
   ```
   Error: LimitExceeded
   ```
   Solution: Check your AWS service limits and request increases if needed.

3. **Database Connection Issues**
   ```
   Error: could not connect to server
   ```
   Solution: Verify security groups and network ACLs allow database access.

### Useful Commands

```bash
# View current state
terraform show

# List all resources
terraform state list

# Get specific output
terraform output database_endpoint

# Refresh state
terraform refresh

# Import existing resources
terraform import aws_s3_bucket.example bucket-name
```

## Support

For issues with this infrastructure setup, please check:
1. AWS service health status
2. Terraform documentation
3. AWS documentation for specific services
4. Project repository issues