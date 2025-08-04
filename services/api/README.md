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
The production environment is configured via Docker Compose environment variables:
```bash
# Production settings for Docker deployment
NODE_ENV=production
DATABASE_URL=postgresql://entvas_user:entvas_password@database:5432/entvas_db
WEBHOOK_API_KEY=entvas_webhook_secret_key_8797f88b5f2e10fbf09d7ef162ffc75b
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

## Webhook Endpoint Documentation

### POST /webhook

Receives and processes webhook events from external systems.

#### Authentication
- **Method**: API Key via `X-API-Key` header
- **Required**: Yes

#### Request Format

```json
{
  "eventType": "page_view",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "metadata": {
    "page": "home",
    "browser": "chrome"
  }
}
```

#### Field Requirements

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `eventType` | string | Yes | Must be one of: `page_view`, `user_joined`, `user_disconnect`, `log`, `user_message` |
| `userId` | string | Yes | Must be a valid UUID format |
| `timestamp` | string | Yes | Must be ISO 8601 format |
| `metadata` | object | No | Optional object with `page` and/or `browser` |

#### Valid Values

**Event Types:**
- `page_view` - User viewed a page
- `user_joined` - User joined the system
- `user_disconnect` - User disconnected
- `log` - General log event
- `user_message` - User sent a message

**Metadata Pages:**
- `home` - Home page
- `profile` - User profile page
- `settings` - Settings page
- `dashboard` - Dashboard page

**Metadata Browsers:**
- `chrome` - Google Chrome
- `firefox` - Mozilla Firefox
- `safari` - Apple Safari
- `edge` - Microsoft Edge

#### Response Format

**Success (200):**
```json
{
  "success": true,
  "message": "Event received successfully",
  "data": {
    "eventId": "550e8400-e29b-41d4-a716-446655440000-2025-01-01T12:00:00.000Z",
    "receivedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "eventType",
      "message": "eventType must be one of: page_view, user_joined, user_disconnect, log, user_message"
    }
  ]
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

#### Example Usage

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
    }
  }'
```

## Testing



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
| `WEBHOOK_API_KEY` | Webhook API key | Required |
| `JWT_ISSUER_DOMAIN` | JWT issuer domain | Required |
| `JWT_AUDIENCE` | JWT audience | Required |