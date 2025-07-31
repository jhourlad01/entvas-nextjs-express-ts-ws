# Real-Time Analytics Dashboard

A web application that receives data from other apps through webhooks, saves it to a database, and shows live charts and numbers on a web page that updates automatically when new data arrives.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Setup

1. **Clone and setup**
```bash
git clone <repository-url>
cd entvas
```

2. **API Server**
```bash
cd api
npm install
cp env.example .env
# Update DATABASE_URL in .env
npm run db:generate
npm run db:push
npm run dev
```

3. **Client App**
```bash
cd client
npm install
npm run dev
```

4. **Test Data (Optional)**
```bash
python3 feeder.py
```

## API Usage

### Webhook Endpoint
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "page_view",
    "userId": "user123", 
    "timestamp": "2024-01-01T12:00:00Z",
    "metadata": {
      "page": "/home",
      "browser": "chrome"
    }
  }'
```

### Get Events
```bash
# Last hour
curl "http://localhost:3000/events?timeRange=hour"

# Last day
curl "http://localhost:3000/events?timeRange=day"

# Get stats
curl "http://localhost:3000/events/stats?timeRange=hour"
```

## Scripts

### API (`api/`)
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Production server
npm run db:studio    # Database GUI
```

### Client (`client/`)
```bash
npm run dev          # Development server
npm run build        # Build for production
```

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: Next.js 15, Material-UI, Chart.js
- **Real-time**: WebSocket
- **Database**: PostgreSQL

## Deployment

- **Dashboard**: [https://entvas-dashboard.vercel.app](https://entvas-dashboard.vercel.app)
- **API**: [https://entvas-api.onrender.com](https://entvas-api.onrender.com)
- **Repo**: [https://github.com/yourusername/entvas](https://github.com/yourusername/entvas)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Why PostgreSQL?

- ACID compliance for data integrity
- JSONB for flexible metadata
- Excellent time-series performance
- Great Prisma integration
- Cost-effective cloud options

## License

MIT License
