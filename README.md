# Entvas - Real-time Analytics Dashboard

A full-stack real-time analytics dashboard built with microservices architecture, featuring WebSocket-powered live data updates, authentication, and comprehensive event tracking.

## Architecture

This project follows a **microservices architecture** with each service in its own dedicated folder:

```
entvas/
├── services/
│   ├── api/           # Node.js/Express API service
│   ├── client/        # Next.js/React client service  
│   ├── postgres/      # PostgreSQL database service
│   └── nginx/         # Nginx reverse proxy service
├── docker-compose.yml # Multi-service orchestration
├── feeder.py         # Event simulation script
└── README.md         # This file
```

## Services Overview

### **API Service** (`services/api/`)
- **Technology**: Node.js, Express, TypeScript
- **Port**: 8000
- **Features**:
  - RESTful API endpoints
  - WebSocket server for real-time updates
  - JWT authentication with Auth0
  - Event processing and storage
  - Database operations with Prisma ORM
  - Pre-segmented data for instant filtering

### **Client Service** (`services/client/`)
- **Technology**: Next.js, React, TypeScript
- **Port**: 3000
- **Features**:
  - Real-time dashboard with live charts
  - WebSocket client for instant updates
  - Auth0 authentication integration
  - Responsive Material-UI components
  - Chart.js visualizations
  - Instant filter switching (no API calls)

### **PostgreSQL Service** (`services/postgres/`)
- **Technology**: PostgreSQL 15
- **Port**: 5432
- **Features**:
  - Event data persistence
  - Optimized schema for analytics
  - Initialization scripts

### **Nginx Service** (`services/nginx/`)
- **Technology**: Nginx Alpine
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**:
  - Reverse proxy for all services
  - SSL/TLS termination
  - Load balancing
  - Static file serving

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.8+ (for event simulation)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd entvas
```

### 2. Environment Configuration

#### Production (Docker)
The project uses production environment files for Docker deployment:

```bash
# Production environment files are already configured:
# - services/api/.env.production
# - services/client/.env.production
```

#### Development (npm)
For local development, create environment files from examples:

```bash
# Copy environment examples
cp services/api/env.example services/api/.env
cp services/client/env.example services/client/.env.local

# Edit environment variables as needed
nano services/api/.env
nano services/client/.env.local
```

### 3. Start All Services
```bash
# Start the entire microservices stack
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Generate Test Data
```bash
# Run the event feeder script
python3 feeder.py
```

## Testing with Event Feeder

The `feeder.py` script simulates real-time webhook events to test the analytics dashboard.

### Basic Usage
```bash
# Start generating random events
python3 feeder.py
```

### Configuration Options
You can customize the feeder behavior using environment variables:

```bash
# Custom webhook URL (default: http://localhost:8000/webhook)
WEBHOOK_URL=http://localhost:8000/webhook python3 feeder.py

# Custom API key (default: entvas_webhook_secret_key_8797f88b5f2e10fbf09d7ef162ffc75b)
WEBHOOK_API_KEY=entvas_custom_webhook_key python3 feeder.py

# Both custom settings
WEBHOOK_URL=http://localhost:8000/webhook WEBHOOK_API_KEY=entvas_custom_webhook_key python3 feeder.py
```

### What It Does
- **Generates random events** every 5-10 seconds
- **Event types**: page_view, user_joined, user_disconnect, log, user_message
- **Metadata**: Includes page, browser, and user information
- **Invalid data**: Occasionally sends invalid events to test error handling
- **Real-time**: Sends events directly to the API webhook endpoint

### Expected Output
```
Starting data generation... Press Ctrl+C to stop
Using API Key: entvas_webhook_secret...
{
  "eventType": "page_view",
  "userId": "123",
  "timestamp": "2025-01-01T12:00:00Z",
  "metadata": {
    "page": "home",
    "browser": "chrome"
  }
}
Webhook response: 200
```

### Stopping the Feeder
Press `Ctrl+C` to stop the event generation.

### 5. Access the Application
- **Dashboard**: http://localhost
- **API**: http://localhost:8000
- **Database**: localhost:5432

## Development

### Environment Management

The project uses separate environment files for different deployment scenarios:

#### Production Environment Files
- **`services/api/.env.production`**: API service production settings
- **`services/client/.env.production`**: Client service production settings

#### Development Environment Files
- **`services/api/.env`**: API service development settings (create from `env.example`)
- **`services/client/.env.local`**: Client service development settings (create from `env.example`)

#### Key Environment Variables

| Service | Variable | Production | Development |
|---------|----------|------------|-------------|
| API | `DATABASE_URL` | `postgresql://user:pass@database:5432/db` | `postgresql://user:pass@localhost:5432/db` |
| Client | `NEXT_PUBLIC_WS_URL` | `ws://localhost/ws` | `ws://localhost:8000` |
| Client | `NEXT_PUBLIC_AUTH0_REDIRECT_URI` | `http://localhost` | `http://localhost:3000` |
| Client | `NEXT_PUBLIC_API_URL` | `http://localhost` | `http://localhost:8000` |

### Running Individual Services

#### API Service
```bash
cd services/api
npm install
npm run dev
```

#### Client Service
```bash
cd services/client
npm install
npm run dev
```

### Database Management
```bash
# Access database
docker-compose exec postgres psql -U entvas_user -d entvas_db

# Run migrations
cd services/api
npx prisma migrate dev
```

## Database Setup and Management

### Quick Start with Docker

The database is automatically started with Docker Compose:

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Check if service is running
docker-compose ps postgres
```

### Database Connection Details

- **Host**: `localhost` (or `postgres` from within containers)
- **Port**: `5432`
- **Database**: `entvas_db`
- **Username**: `entvas_user`
- **Password**: `entvas_password`
- **Connection String**: `postgresql://entvas_user:entvas_password@postgres:5432/entvas_db`

### Database Schema

#### Event Model

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

#### Indexes

The database includes several indexes for optimal query performance:

- `(timestamp, eventType)` - For time-based filtering with event type
- `(userId, timestamp)` - For user-specific time-based queries
- `(eventType, timestamp)` - For event type analysis over time

### Prisma Commands

```bash
cd services/api

# Generate Prisma Client
npm run db:generate

# Push Schema Changes
npm run db:push

# Create and Apply Migrations
npm run db:migrate

# Deploy Migrations (Production)
npm run db:migrate:deploy

# Reset Database
npm run db:reset

# Seed Database with Sample Data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Database Operations

```bash
# Backup database
docker-compose exec postgres pg_dump -U entvas_user entvas_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U entvas_user entvas_db < backup.sql

# View database size
docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SELECT pg_size_pretty(pg_database_size('entvas_db'));"

# Check table sizes
docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname = 'public';"
```

### Troubleshooting

#### Common Issues

1. **Connection Refused**
   - Ensure Docker containers are running: `docker-compose ps`
   - Check if port 5432 is available: `netstat -an | grep 5432`

2. **Authentication Failed**
   - Verify credentials in environment variables
   - Check if database exists: `docker-compose exec postgres psql -U entvas_user -d entvas_db`

3. **Migration Errors**
   - Reset database: `npm run db:reset`
   - Check migration history: `npx prisma migrate status`

#### Useful Commands

```bash
# View database logs
docker-compose logs postgres

# Check database health
docker-compose exec postgres pg_isready -U entvas_user -d entvas_db

# Monitor active connections
docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Check max connections
docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SHOW max_connections;"
```

### Performance Optimization

#### Connection Pooling

For high-traffic applications, configure connection pooling:

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

#### Query Optimization

- Use the provided indexes for filtering
- Implement pagination for large result sets
- Use `select` to limit returned fields
- Consider caching frequently accessed data

#### Monitoring

Monitor database performance using:

- PostgreSQL logs: `docker-compose logs postgres`
- Application logs for slow queries
- Database statistics: `docker-compose exec postgres psql -U entvas_user -d entvas_db -c "SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch FROM pg_stat_user_indexes;"`

### Testing
```bash
# API tests
cd services/api
npm test

# Client tests
cd services/client
npm test
```

## Features

### Real-time Analytics
- **Live Data Updates**: WebSocket-powered real-time dashboard
- **Instant Filtering**: Pre-segmented data for instant time range switching
- **No API Calls**: Pure client-side filtering with WebSocket data
- **Performance Optimized**: Memoized components and debounced updates

### Event Processing
- **Webhook Integration**: External event ingestion via POST endpoint
- **Event Validation**: Comprehensive input validation and sanitization
- **Real-time Broadcasting**: Instant event distribution to all connected clients
- **Data Segmentation**: Server-side pre-computation for all time ranges

### Authentication & Security
- **Auth0 Integration**: JWT-based authentication
- **API Key Protection**: Secure webhook endpoints
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

### Monitoring & Observability
- **Structured Logging**: Comprehensive request/response logging
- **Error Handling**: Graceful error management and reporting
- **Health Checks**: Service health monitoring
- **Performance Metrics**: Real-time performance tracking

## Docker Deployment

### Production Build
```bash
# Build all services
docker-compose build

# Start production stack
docker-compose -f docker-compose.yml up -d
```

### Service Scaling
```bash
# Scale API service
docker-compose up -d --scale api=3

# Scale client service
docker-compose up -d --scale client=2
```

## Project Structure

```
services/
├── api/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   └── server.ts        # Main server file
│   ├── tests/               # Test suites
│   ├── prisma/              # Database schema
│   └── Dockerfile           # API container
├── client/
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   └── hooks/           # Custom hooks
│   ├── public/              # Static assets
│   └── Dockerfile           # Client container
├── database/
│   └── init-db.sql          # Database initialization
└── nginx/
    └── nginx.conf           # Nginx configuration
```

## 🔄 Data Flow

1. **Event Ingestion**: External systems send events via webhook
2. **Event Processing**: API validates and stores events in database
3. **Real-time Broadcasting**: WebSocket broadcasts to all connected clients
4. **Client Updates**: Dashboard components update instantly
5. **Filter Switching**: Pre-segmented data enables instant filtering

## Performance Optimizations

- **WebSocket Single Source**: All data comes from WebSocket, no API calls for filtering
- **Pre-segmented Data**: Server-side computation for hour/day/week views
- **Memoized Components**: React.memo for chart components
- **Debounced Updates**: 300ms debounce for WebSocket updates
- **Animation Disabled**: Chart animations disabled for performance
- **Containerized**: Docker optimization for production deployment

## Monitoring

### Health Checks
- API: `GET /health`
- Client: Built-in Next.js health monitoring
- Database: PostgreSQL connection monitoring

### Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f client
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
