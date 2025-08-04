# Entvas - Real-time Analytics Dashboard

A full-stack real-time analytics dashboard built with microservices architecture, featuring WebSocket-powered live data updates, authentication, and comprehensive event tracking.

## How to Run the App

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd entvas

# Start all services
docker-compose up -d

# Access the application
# Dashboard: http://localhost
# API: http://localhost:8000
```

### Development Setup
```bash
# For local development, create environment files
cp services/api/env.example services/api/.env
cp services/client/env.example services/client/.env.local

# Start individual services
cd services/api && npm install && npm run dev
cd services/client && npm install && npm run dev
```

## API Usage Instructions

### Webhook Endpoint
Receive events from external systems:

```bash
curl -X POST http://localhost:8000/webhook \
  -H "Content-Type: application/json" \
  -H "X-API-Key: entvas_webhook_secret_key_8797f88b5f2e10fbf09d7ef162ffc75b" \
  -d '{
    "eventType": "page_view",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "metadata": {
      "page": "home",
      "browser": "chrome"
    },
    "organizationId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Event Data Format
```json
{
  "eventType": "page_view|user_joined|user_disconnect|log|user_message",
  "userId": "uuid-string",
  "timestamp": "ISO-8601-date-string",
  "metadata": {
    "page": "home|profile|settings|dashboard",
    "browser": "chrome|firefox|safari|edge"
  },
  "organizationId": "uuid-string"
}
```

### Field Specifications

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `eventType` | string | Yes | Type of event | `page_view`, `user_joined`, `user_disconnect`, `log`, `user_message` |
| `userId` | string | Yes | Unique user identifier | Valid UUID format |
| `timestamp` | string | Yes | Event timestamp | ISO 8601 format (e.g., `2025-01-01T12:00:00.000Z`) |
| `metadata` | object | No | Additional event data | Optional object with `page` and/or `browser` |
| `organizationId` | string | No | Organization identifier | Valid UUID format |

### API Endpoints
- `GET /health` - Service health status
- `POST /webhook` - Receive webhook events
- `GET /events` - Retrieve all events
- `GET /events/stats` - Get event statistics
- `GET /users` - User management (admin)
- `GET /organizations` - Organization management
- `GET /organizations/my` - Get user organizations
- `WS /` - Real-time WebSocket streaming

## Database Choice and Reasoning

### PostgreSQL Selection
**Choice**: PostgreSQL 15 with JSONB support

**Reasoning**:
- **JSONB for Metadata**: Efficient storage and querying of flexible event metadata
- **Analytics Performance**: Optimized for read-heavy analytics workloads
- **ACID Compliance**: Ensures data integrity for critical event tracking
- **Indexing**: Advanced indexing capabilities for time-series queries
- **Scalability**: Horizontal scaling with read replicas for high-traffic scenarios

### Schema Design
```prisma
model Event {
  id             String        @id @default(uuid())
  eventType      String
  userId         String
  timestamp      DateTime
  metadata       Json?
  receivedAt     DateTime      @default(now())
  createdAt      DateTime      @default(now())
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([timestamp, eventType])
  @@index([userId, timestamp])
  @@index([eventType, timestamp])
  @@index([organizationId, timestamp])
  @@map("events")
}
```

### Performance Optimizations
- Composite indexes for time-based filtering: `(timestamp, eventType)`
- User-specific queries: `(userId, timestamp)`
- Event type analysis: `(eventType, timestamp)`
- Organization-based queries: `(organizationId, timestamp)`
- JSONB GIN indexes for metadata queries

## Design Patterns Used

### Microservices Architecture
- **API Service**: Node.js/Express with TypeScript
- **Client Service**: Next.js/React with TypeScript
- **Database Service**: PostgreSQL with optimized configuration
- **Proxy Service**: Nginx for load balancing and SSL termination

### Event-Driven Architecture
- **Webhook Ingestion**: External systems send events via REST API
- **Real-time Broadcasting**: WebSocket server broadcasts updates to all clients
- **Event Processing**: Validation, storage, and real-time distribution

### Repository Pattern
- **EventService**: Business logic for event management
- **WebSocketService**: Real-time communication management
- **Database Layer**: Prisma ORM for type-safe database operations

### Observer Pattern
- **WebSocket Broadcasting**: Clients subscribe to real-time updates
- **Event Listeners**: Automatic notification when new events arrive
- **State Management**: React hooks for real-time state synchronization

### Factory Pattern
- **Event Validation**: Joi schema validation with custom error handling
- **Response Formatting**: Consistent API response structure
- **Authentication**: Middleware-based API key validation

## Scaling Strategy

### Horizontal Scaling
- **API Service**: Scale multiple instances behind load balancer
- **Database**: Read replicas for analytics queries
- **WebSocket**: Redis pub/sub for cross-instance communication

### Performance Optimizations
- **Pre-segmented Data**: Server-side computation for all time ranges
- **Client-side Filtering**: No API calls when switching time filters
- **WebSocket Single Source**: All data comes from WebSocket, eliminating polling
- **Database Indexing**: Optimized indexes for common query patterns

### Infrastructure Scaling
- **Container Orchestration**: Kubernetes for production deployment
- **Auto-scaling**: Horizontal Pod Autoscaler based on CPU/memory usage
- **Database Scaling**: Managed PostgreSQL with read replicas
- **CDN**: Static asset delivery via CDN

### Monitoring and Observability
- **Health Checks**: Built-in health monitoring for all services
- **Metrics Collection**: Prometheus metrics for performance monitoring
- **Logging**: Structured logging with correlation IDs
- **Alerting**: Automated alerts for service failures

### Future Scaling Considerations
- **Event Streaming**: Apache Kafka for high-volume event processing
- **Caching Layer**: Redis for frequently accessed data
- **Data Warehousing**: Time-series database for historical analytics
- **Edge Computing**: CDN edge functions for global performance
