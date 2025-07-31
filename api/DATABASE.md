# Database Setup Guide

This guide explains how to set up and manage the PostgreSQL database for the entvas API.

## Quick Start with Docker

### 1. Start the Database

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 2. Database Connection Details

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `entvas_db`
- **Username**: `entvas_user`
- **Password**: `entvas_password`
- **Connection String**: `postgresql://entvas_user:entvas_password@localhost:5432/entvas_db`

### 3. pgAdmin Access

- **URL**: http://localhost:8080
- **Email**: `admin@entvas.com`
- **Password**: `admin123`

## Environment Configuration

Create a `.env` file in the `api` directory:

```bash
# Copy the example file
cp env.example .env

# Edit the DATABASE_URL in .env
DATABASE_URL="postgresql://entvas_user:entvas_password@localhost:5432/entvas_db"
```

## Database Management Commands

### Generate Prisma Client
```bash
npm run db:generate
```

### Push Schema Changes
```bash
npm run db:push
```

### Create and Apply Migrations
```bash
npm run db:migrate
```

### Deploy Migrations (Production)
```bash
npm run db:migrate:deploy
```

### Reset Database
```bash
npm run db:reset
```

### Seed Database with Sample Data
```bash
npm run db:seed
```

### Open Prisma Studio
```bash
npm run db:studio
```

## Database Schema

### Event Model

```prisma
model Event {
  id         String   @id @default(uuid())
  eventType  String
  userId     String
  timestamp  DateTime
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([timestamp, eventType])
  @@index([userId, timestamp])
  @@index([eventType, timestamp])
  @@map("events")
}
```

### Indexes

The database includes several indexes for optimal query performance:

- `(timestamp, eventType)` - For time-based filtering with event type
- `(userId, timestamp)` - For user-specific time-based queries
- `(eventType, timestamp)` - For event type analysis over time

## Production Setup

### 1. Environment Variables

Set these environment variables in production:

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV=production
```

### 2. Database Migrations

```bash
# Deploy migrations
npm run db:migrate:deploy

# Generate Prisma client
npm run db:generate
```

### 3. Connection Pooling

For production, consider using connection pooling:

```bash
# Install pgBouncer or use a managed PostgreSQL service
# Update DATABASE_URL to include connection pool settings
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Docker containers are running: `docker-compose ps`
   - Check if port 5432 is available: `netstat -an | grep 5432`

2. **Authentication Failed**
   - Verify credentials in `.env` file
   - Check if database exists: `docker-compose exec postgres psql -U entvas_user -d entvas_db`

3. **Migration Errors**
   - Reset database: `npm run db:reset`
   - Check migration history: `npx prisma migrate status`

### Useful Commands

```bash
# View logs
docker-compose logs postgres

# Access PostgreSQL shell
docker-compose exec postgres psql -U entvas_user -d entvas_db

# Backup database
docker-compose exec postgres pg_dump -U entvas_user entvas_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U entvas_user -d entvas_db < backup.sql
```

## Performance Optimization

### 1. Connection Pooling

For high-traffic applications, configure connection pooling in your application:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling configuration
  log: ['query', 'info', 'warn', 'error'],
})
```

### 2. Query Optimization

- Use the provided indexes for filtering
- Implement pagination for large result sets
- Use `select` to limit returned fields
- Consider caching frequently accessed data

### 3. Monitoring

Monitor database performance using:

- pgAdmin (included in Docker setup)
- PostgreSQL logs: `docker-compose logs postgres`
- Application logs for slow queries 