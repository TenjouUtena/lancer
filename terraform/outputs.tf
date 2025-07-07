# Outputs for Lancer Terraform configuration

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.lancer_vpc.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public_subnets[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private_subnets[*].id
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.lancer_db.endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS instance port"
  value       = aws_db_instance.lancer_db.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.lancer_db.db_name
}

output "database_username" {
  description = "Database username"
  value       = aws_db_instance.lancer_db.username
  sensitive   = true
}

output "database_secret_arn" {
  description = "ARN of the database credentials secret"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for assets"
  value       = aws_s3_bucket.lancer_assets.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket for assets"
  value       = aws_s3_bucket.lancer_assets.arn
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.lancer_api.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.lancer_cluster.name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.lancer_cluster.arn
}

output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.lancer_alb.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.lancer_alb.zone_id
}

output "api_url" {
  description = "URL of the API"
  value       = "http://${aws_lb.lancer_alb.dns_name}"
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.lancer_api_logs.name
}

# Connection string for the application
output "connection_string" {
  description = "Database connection string for the application"
  value       = "Host=${aws_db_instance.lancer_db.endpoint};Port=${aws_db_instance.lancer_db.port};Database=${aws_db_instance.lancer_db.db_name};Username=${aws_db_instance.lancer_db.username};Password=${random_password.db_password.result}"
  sensitive   = true
}