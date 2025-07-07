-- Initial database setup for Lancer application
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database (if not exists)
SELECT 'CREATE DATABASE lancer'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'lancer');

-- Connect to lancer database
\c lancer;

-- Set timezone
SET timezone = 'UTC';

-- Create schema for application
CREATE SCHEMA IF NOT EXISTS lancer;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA lancer TO lanceruser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA lancer TO lanceruser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA lancer TO lanceruser;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA lancer GRANT ALL ON TABLES TO lanceruser;
ALTER DEFAULT PRIVILEGES IN SCHEMA lancer GRANT ALL ON SEQUENCES TO lanceruser;

-- Insert some initial data (optional)
-- This will be replaced by Entity Framework migrations in production

COMMENT ON DATABASE lancer IS 'Lancer application database';
COMMENT ON SCHEMA lancer IS 'Main application schema';