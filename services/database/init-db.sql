-- Initialize database for entvas application
-- This script runs when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (already created by POSTGRES_DB env var)
-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE entvas_db TO entvas_user;

-- Connect to the entvas_db database
\c entvas_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO entvas_user;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO entvas_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO entvas_user; 