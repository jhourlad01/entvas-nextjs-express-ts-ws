# API Service

Node.js/Express API service with TypeScript, WebSocket support, and PostgreSQL integration.

## Features

- **RESTful API**: Event management and statistics endpoints
- **WebSocket Server**: Real-time data broadcasting
- **Authentication**: JWT-based Auth0 integration
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Joi schema validation
- **Testing**: Jest and Supertest integration

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Auth0 account (for authentication)

### Installation
```bash
npm install
```

### Environment Setup

#### Production (Docker)
The production environment is configured in `.env.production`:
```bash
# Production settings for Docker deployment
NODE_ENV=production
DATABASE_URL=postgresql://entvas_user:entvas_password@database:5432/entvas_db
# ... other production settings
```

#### Development (npm)
For local development, create environment from example:
```bash
cp env.example .env
# Edit .env with your local configuration
```

### Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### Development
```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Events
- `POST /webhook` - Receive webhook events
- `GET /events` - Get filtered events
- `GET /events/stats` - Get event statistics
- `GET /events/export` - Export events to CSV

### WebSocket
- `WS /` - Real-time data streaming

## Testing

### Event Simulation
Use the `feeder.py` script in the root directory to simulate webhook events:

```bash
# From the project root
python3 feeder.py
```

**Note**: The feeder script is configured to send webhooks to `http://localhost:8000/webhook` (direct to API) by default. You can override this by setting the `WEBHOOK_URL` environment variable:

```bash
# For Docker setup (default)
WEBHOOK_URL=http://localhost:8000/webhook python3 feeder.py

# For local development
WEBHOOK_URL=http://localhost:8000/webhook python3 feeder.py
```

### API Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/server.test.ts

# Run tests with watch mode
npm run test:watch
```

## Docker

### Build
```bash
docker build -t entvas-api .
```

### Run
```bash
docker run -p 8000:8000 entvas-api
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection | Required |
| `AUTH0_DOMAIN` | Auth0 domain | Required |
| `AUTH0_AUDIENCE` | Auth0 audience | Required |
| `AUTH0_CLIENT_ID` | Auth0 client ID | Required |
| `AUTH0_CLIENT_SECRET` | Auth0 client secret | Required |
| `WEBHOOK_API_KEY` | Webhook authentication | Required |
| `LOG_LEVEL` | Logging level | `info` |

## Architecture

### Directory Structure
```
src/
├── routes/          # API route handlers
├── services/        # Business logic
├── middleware/      # Express middleware
├── utils/           # Utility functions
└── server.ts        # Main server file
```

### Key Components

- **EventService**: Event processing and storage
- **WebSocketService**: Real-time data broadcasting
- **AuthMiddleware**: JWT authentication
- **ValidationMiddleware**: Request validation
- **ErrorMiddleware**: Error handling

## Monitoring

### Health Checks
- Service health: `GET /health`
- Database connectivity: Built into health check
- WebSocket status: Available via WebSocket connection

### Logging
- Structured logging with different levels
- Request/response logging
- Error tracking and reporting

## Performance

### Optimizations
- Database connection pooling
- WebSocket connection management
- Request validation and sanitization
- Pre-segmented data for instant filtering

### Scaling
- Horizontal scaling support
- Database read replicas
- WebSocket clustering with Redis (planned)