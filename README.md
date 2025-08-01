# Real-Time Analytics Dashboard

A production-ready web application that receives webhook data and displays live analytics charts with real-time updates.

## Live Application

**Production URLs:**
- **Dashboard**: https://entvas-dashboard.vercel.app
- **API**: https://entvas-api.onrender.com
- **GitHub Repository**: https://github.com/jhourlad01/entvas-nextjs-express-ts-ws

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running the Application
```bash
# Clone the repository
git clone https://github.com/jhourlad01/entvas-nextjs-express-ts-ws.git
cd entvas-nextjs-express-ts-ws

# Start all services
docker-compose up -d

# Access the application
# Dashboard: http://localhost
# API: http://localhost/health
```

##  API Usage

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/webhook` | Receive webhook events |
| `GET` | `/events` | Get filtered events |
| `GET` | `/events/stats` | Get event statistics |

### API Testing Examples

#### 1. Health Check
```bash
curl http://localhost/health
```

#### 2. Send Webhook Event
```bash
curl -X POST http://localhost/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "page_view",
    "userId": "123",
    "timestamp": "2024-01-01T12:00:00Z",
    "metadata": {"page": "home"}
  }'
```

#### 3. Get Events (Last Hour)
```bash
curl "http://localhost/events?filter=hour"
```

#### 4. Get Event Statistics
```bash
curl "http://localhost/events/stats?filter=day"
```

#### 5. Get Events with Different Filters
```bash
# Last hour
curl "http://localhost/events?filter=hour"

# Last day
curl "http://localhost/events?filter=day"

# Last week
curl "http://localhost/events?filter=week"
```

### Postman Collection
Import this collection to test all endpoints:
```json
{
  "info": {
    "name": "Entvas API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost/health"
      }
    },
    {
      "name": "Send Webhook",
      "request": {
        "method": "POST",
        "url": "http://localhost/webhook",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"eventType\": \"page_view\",\n  \"userId\": \"123\",\n  \"timestamp\": \"2024-01-01T12:00:00Z\",\n  \"metadata\": {\"page\": \"home\"}\n}"
        }
      }
    }
  ]
}
```

## Architecture & Design Patterns

### Backend Architecture

#### 1. **MVC Pattern**
- **Models**: Prisma ORM with PostgreSQL
- **Views**: JSON API responses
- **Controllers**: Express route handlers

#### 2. **Repository Pattern**
```typescript
// EventService abstracts data access
export class EventService {
  static async addEvent(event: Event): Promise<void>
  static async getEvents(filter: TimeFilter): Promise<Event[]>
  static async getStatistics(filter: TimeFilter): Promise<Statistics>
}
```

#### 3. **Middleware Pattern**
- Authentication middleware
- Validation middleware (Joi)
- Logging middleware
- CORS middleware

#### 4. **Observer Pattern**
- WebSocket event broadcasting
- Real-time updates to connected clients

### Frontend Architecture

#### 1. **Component Pattern**
- Reusable UI components
- Material-UI component library
- Custom chart components

#### 2. **Custom Hooks Pattern**
```typescript
// useWebSocket hook for real-time data
const { events, isConnected } = useWebSocket();

// useEvents hook for data fetching
const { events, loading, error } = useEvents();
```

#### 3. **Service Layer Pattern**
- API client services
- WebSocket service
- Data transformation services

## Database Choice: PostgreSQL

### Database Schema
```sql
-- Events table with JSONB for flexible metadata
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  metadata JSONB,
  received_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_user ON events(user_id);
```

##  Scaling Strategy

### Current Architecture Supports:

#### 1. **Horizontal Scaling**
```yaml
# Scale API instances
docker-compose up --scale api=3

# Scale client instances  
docker-compose up --scale client=3
```

#### 2. **Database Scaling**
- **Read Replicas**: Distribute read load
- **Connection Pooling**: Efficient connection management
- **Partitioning**: Split data by time ranges
- **Sharding**: Distribute data across multiple databases

#### 3. **WebSocket Scaling**
- **Redis Pub/Sub**: Share WebSocket connections across instances
- **Load Balancer**: Distribute WebSocket connections
- **Sticky Sessions**: Maintain connection consistency

#### 4. **Performance Optimizations**
- **Nginx Caching**: Static file caching
- **CDN**: Global content delivery
- **Database Indexing**: Optimized queries
- **Rate Limiting**: Prevent abuse

### Scaling for 100K+ Users

1. **Load Balancer**: Nginx/HAProxy for traffic distribution
2. **Multiple API Instances**: Auto-scaling based on load
3. **Database Clustering**: Primary + read replicas
4. **Redis Cluster**: Session and cache management
5. **CDN**: Global static asset delivery
6. **Monitoring**: Prometheus + Grafana for metrics

## Tech Stack

### Backend
- **Runtime**: Node.js 18 with TypeScript
- **Framework**: Express.js with middleware architecture
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Joi schema validation
- **Real-time**: WebSocket with ws library

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: Material-UI (MUI) v7
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: Emotion CSS-in-JS
- **Real-time**: WebSocket client

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for production
- **Reverse Proxy**: Nginx with rate limiting
- **Database**: PostgreSQL with persistence

## Development

### Local Development
```bash
# Install dependencies
cd api && npm install
cd ../client && npm install

# Run development servers
cd api && npm run dev
cd ../client && npm run dev
```

### Testing
```bash
# API tests
cd api && npm run test

# Client tests  
cd client && npm run test

# All tests
npm run test:all
```

### Database Management
```bash
# Generate Prisma client
cd api && npx prisma generate

# Run migrations
cd api && npx prisma migrate dev

# Open database studio
cd api && npx prisma studio
```

## Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs api
docker-compose logs client

# Rebuild containers
docker-compose build --no-cache
```

#### Database Issues
```bash
# Reset database
docker-compose exec api npx prisma migrate reset

# Check database connection
docker-compose exec api npx prisma db push
```

#### API Issues
```bash
# Test API health
curl http://localhost/health

# Check API logs
docker-compose logs api --tail=50
```
